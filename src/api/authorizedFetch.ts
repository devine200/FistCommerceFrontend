import { resetAuth, type UserRole } from '@/store/slices/authSlice'

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
  const { store } = await import('@/store')
  const { role, accessToken } = store.getState().auth
  const path = redirectPathAfterAuthFailure(accessToken, role)
  store.dispatch(resetAuth())
  window.location.assign(path)
}

/**
 * Performs `fetch`, then on 401/403 for requests using `Authorization: Token …`:
 * - With a refresh token: one shared refresh and retry; if refresh fails, logout and redirect
 *   (admin → `/admin/login`, wallet users → connect wallet or choose-role).
 * - Without a refresh token: same logout and redirect (session cannot be renewed).
 *
 * Uses dynamic `import()` for the Redux store and session refresh so this module does not create a
 * circular dependency with `store/index.ts` (metrics → authorizedFetch → store → slices → metrics).
 */
export async function fetchWithAuthRecovery(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(input, init)
  if (res.ok || !isAuthFailureStatus(res.status)) {
    return res
  }

  if (!usesDrfTokenAuth(init.headers)) {
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
