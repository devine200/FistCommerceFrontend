import type { SessionKind } from '@/store/slices/authSlice'

/**
 * @deprecated Legacy mock token from before `POST /api/auth/admin-login` was wired.
 * Persisted sessions with this value are still treated as admin until re-login.
 */
export const ADMIN_PLACEHOLDER_ACCESS_TOKEN = 'admin-session'

export const ADMIN_LOGIN_PATH = '/admin/login'
export const ADMIN_DASHBOARD_OVERVIEW_PATH = '/dashboard/admin/overview'

export function isAdminSession(
  accessToken: string | null | undefined,
  sessionKind: SessionKind | undefined,
): boolean {
  if (sessionKind === 'admin') return Boolean(accessToken?.trim())
  return accessToken?.trim() === ADMIN_PLACEHOLDER_ACCESS_TOKEN
}

/** @deprecated Prefer {@link isAdminSession} with `sessionKind`. */
export function isAdminAccessToken(
  token: string | null | undefined,
  sessionKind?: SessionKind,
): boolean {
  return isAdminSession(token, sessionKind)
}

export function isAdminDashboardPath(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard/admin') &&
    pathname !== '/dashboard/admin/login' &&
    !pathname.startsWith('/dashboard/admin/login/')
  )
}

export function isAdminLoginPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname === '/dashboard/admin/login'
}

export type AdminLogoutContext = {
  accessToken?: string | null
  sessionKind?: SessionKind
  pathname?: string
}

/** Whether session expiry / reset should send the user to admin login (not onboarding). */
export function shouldRedirectToAdminLogin(ctx: AdminLogoutContext): boolean {
  if (ctx.sessionKind === 'admin') return true
  const path = ctx.pathname
  if (path && (isAdminDashboardPath(path) || isAdminLoginPath(path))) return true
  return isAdminSession(ctx.accessToken, ctx.sessionKind)
}
