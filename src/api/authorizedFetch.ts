import { MAX_AUTHORIZATION_HEADER_CHARS } from '@/auth/accessTokenPolicy'
import type { UserRole } from '@/store/slices/authSlice'

import { parseUserRole } from '@/utils/userRole'

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

/** Matches `AdminLoginPage` placeholder token — used only to choose redirect after auth failure. */
const ADMIN_PLACEHOLDER_ACCESS_TOKEN = 'admin-session'

function redirectPathAfterAuthFailure(accessToken: string | null | undefined, role: UserRole | null): string {
  if (accessToken?.trim() === ADMIN_PLACEHOLDER_ACCESS_TOKEN) {
    return '/admin/login'
  }
  return connectWalletPathForRole(role)
}

async function logoutAndRedirectAfterAuthFailure(): Promise<void> {
  const { store, persistor } = await import('@/store')
  const { role: roleRaw, accessToken } = store.getState().auth
  const role = parseUserRole(roleRaw)
  const path = redirectPathAfterAuthFailure(accessToken, role)
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
  const { role: roleRaw, accessToken } = store.getState().auth
  const role = parseUserRole(roleRaw)
  const path = redirectPathAfterAuthFailure(accessToken, role)
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
 * - **401/403** + `Authorization: Token …`: with refresh token → refresh and retry once; without or
 *   if refresh fails → logout and redirect (admin → `/admin/login`, wallet → connect-wallet or
 *   choose-role).
 *
 * Uses dynamic `import()` for the Redux store and session refresh so this module does not create a
 * circular dependency with `store/index.ts` (metrics → authorizedFetch → store → slices → metrics).
 */
export async function fetchWithAuthRecovery(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
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
  return fetch(input, { ...init, headers: nextHeaders })
}
