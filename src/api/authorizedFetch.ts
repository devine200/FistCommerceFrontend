import { MAX_AUTHORIZATION_HEADER_CHARS } from '@/auth/accessTokenPolicy'
import { ADMIN_LOGIN_PATH, shouldRedirectToAdminLogin } from '@/auth/adminSession'
import type { SessionKind, UserRole } from '@/store/slices/authSlice'
import { parseUserRole } from '@/utils/userRole'

/** Marks that token refresh already ran for this logical request (prevents refresh loops). */
const AUTH_RETRIED = Symbol('authRetried')

type AuthRecoveryInit = RequestInit & {
  [AUTH_RETRIED]?: boolean
}

function hasAuthRetried(init: RequestInit): boolean {
  return Boolean((init as AuthRecoveryInit)[AUTH_RETRIED])
}

/** DRF auth failures are often 401; some gateways or configs surface 403 instead. */
function isAuthFailureStatus(status: number): boolean {
  return status === 401 || status === 403
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

function connectWalletPathForRole(role: UserRole | null): string {
  if (role === 'investor' || role === 'merchant') {
    return `/onboarding/${role}/connect-wallet`
  }
  return '/onboarding/choose-role'
}

function redirectPathAfterAuthFailure(
  accessToken: string | null | undefined,
  role: UserRole | null,
  sessionKind: SessionKind,
): string {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : undefined
  if (shouldRedirectToAdminLogin({ accessToken, sessionKind, pathname })) {
    return ADMIN_LOGIN_PATH
  }
  return connectWalletPathForRole(role)
}

async function logoutAndRedirectAfterAuthFailure(): Promise<void> {
  const { store, persistor } = await import('@/store')
  const { role: roleRaw, accessToken, sessionKind } = store.getState().auth
  const role = parseUserRole(roleRaw)
  const path = redirectPathAfterAuthFailure(accessToken, role, sessionKind)
  const { recordSessionDiagnostic } = await import('@/session/sessionDiagnostics')
  recordSessionDiagnostic({
    event: 'auth_failure_logout',
    redirectTo: path,
    role,
    note: '401/403 after refresh failure or missing refresh',
  })
  const { resetUserSession } = await import('@/session/resetUserSession')
  resetUserSession(store.dispatch)
  await persistor.flush()
  window.location.assign(path)
}

/**
 * 431 Request Header Fields Too Large — often a corrupted oversized `Token` header. Full session
 * reset (not refresh; retry would resend the bad header).
 */
async function logoutHeaderTooLargeAndRedirect(): Promise<void> {
  const { store, persistor } = await import('@/store')
  const { role: roleRaw, accessToken, sessionKind } = store.getState().auth
  const role = parseUserRole(roleRaw)
  const path = redirectPathAfterAuthFailure(accessToken, role, sessionKind)
  const { recordSessionDiagnostic } = await import('@/session/sessionDiagnostics')
  recordSessionDiagnostic({
    event: 'auth_failure_logout',
    redirectTo: path,
    role,
    note: 'header too large / 431 path',
    accessTokenLen: accessToken?.length ?? 0,
  })
  const { resetUserSession } = await import('@/session/resetUserSession')
  resetUserSession(store.dispatch)
  await persistor.flush()
  window.location.assign(path)
}

/**
 * Performs `fetch`, then:
 * - **Preflight**: if `Authorization: Token …` exceeds client/header limits → full session reset and
 *   redirect (no network request).
 * - **431 / 413 / narrow 400** (proxy “header too large” body) + `Authorization: Token …`: full
 *   session reset and redirect (no refresh).
 * - **401/403** + `Authorization: Token …`: with refresh token → refresh and retry once; a second
 *   401/403 on that retry, missing refresh token, or failed refresh → logout and redirect.
 *
 * Uses dynamic `import()` for the Redux store and session refresh so this module does not create a
 * circular dependency with `store/index.ts` (metrics → authorizedFetch → store → slices → metrics).
 */
export async function fetchWithAuthRecovery(
  input: RequestInfo | URL,
  init: AuthRecoveryInit = {},
): Promise<Response> {
  if (usesDrfTokenAuth(init.headers)) {
    const authLine = authorizationHeaderFromInit(init.headers)
    if (authLine && authLine.length > MAX_AUTHORIZATION_HEADER_CHARS) {
      await logoutHeaderTooLargeAndRedirect()
      return new Response(null, { status: 431 })
    }
  }

  const res = await fetch(input, init)
  if (res.ok) {
    return res
  }

  const tokenAuth = usesDrfTokenAuth(init.headers)
  if (tokenAuth && (res.status === 431 || res.status === 413)) {
    await logoutHeaderTooLargeAndRedirect()
    return res
  }

  if (tokenAuth && res.status === 400) {
    const bodySnippet = await res.clone().text()
    if (isLikelyProxyRequestHeaderTooLargeBody(bodySnippet)) {
      await logoutHeaderTooLargeAndRedirect()
      return res
    }
  }

  if (!isAuthFailureStatus(res.status)) {
    return res
  }

  if (!tokenAuth) {
    return res
  }

  if (hasAuthRetried(init)) {
    await logoutAndRedirectAfterAuthFailure()
    return res
  }

  const { store } = await import('@/store')
  const { refreshToken } = store.getState().auth
  if (!refreshToken?.trim()) {
    await logoutAndRedirectAfterAuthFailure()
    return res
  }

  const tokens = await coalescedRefreshSessionTokens()
  if (!tokens) {
    await logoutAndRedirectAfterAuthFailure()
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
