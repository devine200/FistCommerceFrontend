import { MAX_AUTHORIZATION_HEADER_CHARS } from '@/auth/accessTokenPolicy'
import type { SessionEndReason } from '@/session/sessionEnd'

/** Marks that token refresh already ran for this logical request (prevents refresh loops). */
const AUTH_RETRIED = Symbol('authRetried')

/** Ignore session-expiry side effects briefly after a fresh login (stale 401 races). */
const FRESH_AUTH_GRACE_MS = 15_000

type AuthRecoveryInit = RequestInit & {
  [AUTH_RETRIED]?: boolean
}

function hasAuthRetried(init: RequestInit): boolean {
  return Boolean((init as AuthRecoveryInit)[AUTH_RETRIED])
}

/** Unauthenticated — refresh/logout path. Permission 403 is returned to the caller (not a session wipe). */
function isAuthFailureStatus(status: number): boolean {
  return status === 401
}

function authorizationHeaderFromInit(headers: RequestInit['headers']): string | null {
  if (!headers) return null
  if (headers instanceof Headers) {
    return headers.get('Authorization') ?? headers.get('authorization')
  }
  if (Array.isArray(headers)) {
    for (const [k, v] of headers) {
      if (k.toLowerCase() === 'authorization' && typeof v === 'string') return v
    }
    return null
  }
  const rec = headers as Record<string, string>
  const a = rec.Authorization ?? rec.authorization
  return typeof a === 'string' ? a : null
}

function accessTokenFromAuthHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null
  const trimmed = authHeader.trim()
  const match = /^Token\s+(\S+)/i.exec(trimmed)
  return match?.[1]?.trim() ?? null
}

function usesDrfTokenAuth(headers: RequestInit['headers']): boolean {
  const raw = authorizationHeaderFromInit(headers)
  if (!raw) return false
  return /^Token\s+\S+/i.test(raw.trim())
}

/** nginx / proxies often return 400 HTML with "Request Header Or Cookie Too Large". */
function isLikelyProxyRequestHeaderTooLargeBody(text: string): boolean {
  const s = text.slice(0, 2048).toLowerCase()
  return s.includes('request header') && s.includes('large')
}

type RefreshSessionResult = Awaited<
  ReturnType<typeof import('@/state/session').refreshSessionTokensFromApi>
>

let refreshCoalesce: Promise<RefreshSessionResult> | null = null

function coalescedRefreshSessionTokens(): Promise<RefreshSessionResult> {
  if (!refreshCoalesce) {
    refreshCoalesce = import('@/state/session')
      .then((m) => m.refreshSessionTokensFromApi())
      .finally(() => {
        refreshCoalesce = null
      })
  }
  return refreshCoalesce
}

function isWithinFreshAuthGrace(authIssuedAt: number | null | undefined): boolean {
  if (authIssuedAt == null || !Number.isFinite(authIssuedAt)) return false
  return Date.now() - authIssuedAt < FRESH_AUTH_GRACE_MS
}

async function endSessionAfterAuthFailure(
  reason: SessionEndReason,
  options?: { failedAccessToken?: string | null },
): Promise<void> {
  const { store } = await import('@/store')
  const { role: roleRaw, accessToken, sessionKind, authIssuedAt } = store.getState().auth

  if (options?.failedAccessToken) {
    const current = accessToken?.trim()
    const failed = options.failedAccessToken.trim()
    if (current && failed && current !== failed) {
      return
    }
  }

  if (isWithinFreshAuthGrace(authIssuedAt)) {
    return
  }

  const { markAppSessionExpired } = await import('@/session/sessionEnd')
  await markAppSessionExpired(store.dispatch, {
    reason,
    accessToken,
    sessionKind,
    role: roleRaw,
    keepRole: true,
  })
}

/**
 * Performs `fetch`, then:
 * - **Preflight**: if `Authorization: Token …` exceeds client/header limits → session end and
 *   redirect (no network request).
 * - **431 / 413 / narrow 400** (proxy “header too large” body) + `Authorization: Token …`: session
 *   end and redirect (no refresh).
 * - **401** + `Authorization: Token …`: with refresh token → refresh and retry once; a second
 *   401 on that retry, missing refresh token, or failed refresh → mark session expired (choice modal).
 *   Admin sessions skip refresh (wallet sign-in is the source of truth).
 * - **403** is treated as a permission/resource error for the caller (does not clear the session).
 *
 * Uses dynamic `import()` for the Redux store and session refresh so this module does not create a
 * circular dependency with `store/index.ts` (metrics → authorizedFetch → store → slices → metrics).
 */
export async function fetchWithAuthRecovery(
  input: RequestInfo | URL,
  init: AuthRecoveryInit = {},
): Promise<Response> {
  const requestAuthHeader = authorizationHeaderFromInit(init.headers)
  const requestAccessToken = accessTokenFromAuthHeader(requestAuthHeader)

  if (usesDrfTokenAuth(init.headers)) {
    if (requestAuthHeader && requestAuthHeader.length > MAX_AUTHORIZATION_HEADER_CHARS) {
      await endSessionAfterAuthFailure('header_too_large', {
        failedAccessToken: requestAccessToken,
      })
      return new Response(null, { status: 431 })
    }
  }

  const res = await fetch(input, init)
  if (res.ok) {
    return res
  }

  const tokenAuth = usesDrfTokenAuth(init.headers)
  if (tokenAuth && (res.status === 431 || res.status === 413)) {
    await endSessionAfterAuthFailure('header_too_large', {
      failedAccessToken: requestAccessToken,
    })
    return res
  }

  if (tokenAuth && res.status === 400) {
    const bodySnippet = await res.clone().text()
    if (isLikelyProxyRequestHeaderTooLargeBody(bodySnippet)) {
      await endSessionAfterAuthFailure('header_too_large', {
        failedAccessToken: requestAccessToken,
      })
      return res
    }
  }

  if (!isAuthFailureStatus(res.status)) {
    return res
  }

  if (!tokenAuth) {
    return res
  }

  const { store } = await import('@/store')
  const { sessionKind, authIssuedAt } = store.getState().auth

  // Admin API tokens come from wallet sign-in; do not rotate via the user refresh-token endpoint.
  if (sessionKind === 'admin') {
    if (isWithinFreshAuthGrace(authIssuedAt)) {
      return res
    }
    await endSessionAfterAuthFailure('refresh_expired', {
      failedAccessToken: requestAccessToken,
    })
    return res
  }

  if (hasAuthRetried(init)) {
    await endSessionAfterAuthFailure('refresh_expired', {
      failedAccessToken: requestAccessToken,
    })
    return res
  }

  const { refreshToken } = store.getState().auth
  if (!refreshToken?.trim()) {
    await endSessionAfterAuthFailure('missing_refresh', {
      failedAccessToken: requestAccessToken,
    })
    return res
  }

  const tokens = await coalescedRefreshSessionTokens()
  if (!tokens) {
    await endSessionAfterAuthFailure('refresh_failed', {
      failedAccessToken: requestAccessToken,
    })
    return res
  }

  const nextHeaders = new Headers(init.headers)
  nextHeaders.set('Authorization', `Token ${tokens.accessToken.trim()}`)
  return fetchWithAuthRecovery(input, {
    ...init,
    headers: nextHeaders,
    [AUTH_RETRIED]: true,
  })
}
