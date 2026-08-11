import { MAX_AUTHORIZATION_HEADER_CHARS } from '@/auth/accessTokenPolicy'
import type { SessionEndReason } from '@/session/sessionEnd'
import type { RootState } from '@/store'

/** Marks that token refresh already ran for this logical request (prevents refresh loops). */
const AUTH_RETRIED = Symbol('authRetried')

/**
 * Ignore session-expiry briefly after a fresh login for *stale* in-flight 401s.
 * Never used after a refresh+retry for the same logical request (see skipFreshAuthGrace).
 */
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

async function readFailureBodySnippet(res: Response): Promise<string> {
  try {
    return (await res.clone().text()).slice(0, 4096)
  } catch {
    return ''
  }
}

/** Flatten common DRF / API error shapes into one searchable string. */
function normalizeAuthFailureMessage(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const rec = parsed as Record<string, unknown>
      const parts: string[] = []
      for (const key of ['detail', 'message', 'error', 'code', 'error_code', 'errorCode']) {
        const v = rec[key]
        if (typeof v === 'string' && v.trim()) parts.push(v.trim())
        else if (Array.isArray(v)) {
          for (const item of v) {
            if (typeof item === 'string' && item.trim()) parts.push(item.trim())
          }
        }
      }
      if (parts.length) return parts.join(' ')
    }
  } catch {
    /* plain text body */
  }
  return trimmed
}

/** Backend denied the call because KYC / identity / insurance is incomplete — not a dead session. */
function isVerificationDenialMessage(message: string): boolean {
  const t = message.trim()
  if (!t) return false
  return (
    /kyc.*(required|incomplete|not verified|pending)/i.test(t) ||
    /complete.*(kyc|identity|verification)/i.test(t) ||
    /identity verification required/i.test(t) ||
    /verification required/i.test(t) ||
    /not (yet )?verified/i.test(t) ||
    /insurance.*(required|not verified|pending)/i.test(t) ||
    /kyb/i.test(t)
  )
}

/** Classic credential / token failures (session should refresh or end). */
function isLikelyCredentialAuthFailureMessage(message: string): boolean {
  const t = message.trim()
  if (!t) return true
  return (
    /invalid token/i.test(t) ||
    /token expired/i.test(t) ||
    /token not valid/i.test(t) ||
    /authentication credentials/i.test(t) ||
    /not authenticated/i.test(t) ||
    /authentication failed/i.test(t) ||
    /please (log|sign) in/i.test(t) ||
    /login required/i.test(t) ||
    /^unauthorized$/i.test(t)
  )
}

/**
 * Expire only when a 401 is unexpected for this user's verification level.
 * Verification denials never expire. Verified users: any remaining 401 expires.
 * Unverified: expire only for clear credential failures (so mid-KYC isn't kicked for ambiguous gates).
 */
function shouldExpireSessionOnAuthFailure(failureMessage: string, isKycVerified: boolean): boolean {
  if (isVerificationDenialMessage(failureMessage)) return false
  if (isKycVerified) return true
  return isLikelyCredentialAuthFailureMessage(failureMessage)
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
  options?: {
    failedAccessToken?: string | null
    /** When true, do not suppress expiry after a successful refresh (retry still 401). */
    skipFreshAuthGrace?: boolean
  },
): Promise<void> {
  const { store } = await import('@/store')
  const { role: roleRaw, accessToken, sessionKind, authIssuedAt } = store.getState().auth

  if (options?.failedAccessToken) {
    const current = accessToken?.trim()
    const failed = options.failedAccessToken.trim()
    // Another login already replaced the token this request used — ignore stale 401.
    if (current && failed && current !== failed) {
      return
    }
  }

  if (!options?.skipFreshAuthGrace && isWithinFreshAuthGrace(authIssuedAt)) {
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

async function resolveIsKycVerified(state: RootState): Promise<boolean> {
  const { selectIsKycVerified } = await import('@/store/selectors/sessionSelectors')
  return selectIsKycVerified(state)
}

/**
 * Performs `fetch`, then:
 * - **Preflight**: if `Authorization: Token …` exceeds client/header limits → session end (no network).
 * - **431 / 413 / narrow 400** (proxy “header too large”) + Token auth → session end (no refresh).
 * - **401** + Token auth:
 *   - KYC / verification denial body → return to caller (no refresh, no expiry).
 *   - Otherwise refresh once (coalesced) and retry once (admin and app sessions).
 *   - Refresh failure or second 401 → expire session only when unexpected for verification level.
 *     Admin sessions always expire if refresh is missing or fails.
 * - **403** is a permission/resource error for the caller (does not clear the session).
 *
 * Uses dynamic `import()` for the Redux store and session refresh so this module does not create a
 * circular dependency with `store/index.ts`.
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
    const bodySnippet = await readFailureBodySnippet(res)
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

  const failureMessage = normalizeAuthFailureMessage(await readFailureBodySnippet(res))

  // Verification gates are not session expiry — never refresh/expire for them.
  if (isVerificationDenialMessage(failureMessage)) {
    return res
  }

  const { store } = await import('@/store')
  const state = store.getState()
  const { sessionKind, authIssuedAt } = state.auth
  const isKycVerified = await resolveIsKycVerified(state)
  const isAdminSession = sessionKind === 'admin'
  const shouldExpire =
    isAdminSession || shouldExpireSessionOnAuthFailure(failureMessage, isKycVerified)

  if (hasAuthRetried(init)) {
    if (shouldExpire) {
      await endSessionAfterAuthFailure('refresh_expired', {
        failedAccessToken: requestAccessToken,
        skipFreshAuthGrace: true,
      })
    }
    return res
  }

  const { refreshToken } = state.auth
  if (!refreshToken?.trim()) {
    if (isAdminSession && isWithinFreshAuthGrace(authIssuedAt)) {
      return res
    }
    if (shouldExpire) {
      await endSessionAfterAuthFailure('missing_refresh', {
        failedAccessToken: requestAccessToken,
      })
    }
    return res
  }

  // Single coalesced refresh (even mid-KYC — profile/KYC calls still need a live token).
  const tokens = await coalescedRefreshSessionTokens()
  if (!tokens) {
    const latest = store.getState()
    const latestVerified = await resolveIsKycVerified(latest)
    const expireAfterRefreshFail =
      latest.auth.sessionKind === 'admin' ||
      shouldExpireSessionOnAuthFailure(failureMessage, latestVerified)
    if (expireAfterRefreshFail) {
      await endSessionAfterAuthFailure('refresh_failed', {
        failedAccessToken: requestAccessToken,
        skipFreshAuthGrace:
          latest.auth.sessionKind === 'admin' ||
          latestVerified ||
          isLikelyCredentialAuthFailureMessage(failureMessage),
      })
    }
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
