import type { UserRole } from '@/store/slices/authSlice'
import { dashboardOverviewPath } from '@/utils/userRole'

const STORAGE_KEY = 'fistcommerce.dashboardReturnTo'

/** Investor/merchant dashboard paths safe to restore after session repair. */
export function isSafeDashboardReturnPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  return /^\/dashboard\/(investor|merchant)(\/|$)/.test(path)
}

export function saveDashboardReturnTo(path: string): void {
  if (!isSafeDashboardReturnPath(path)) return
  try {
    sessionStorage.setItem(STORAGE_KEY, path)
  } catch {
    /* storage disabled */
  }
}

/** Restores a saved dashboard path for the role, or the role overview. Clears storage when used. */
export function resolveDashboardReturnTo(role: UserRole): string {
  const fallback = dashboardOverviewPath(role)
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored || !isSafeDashboardReturnPath(stored) || !stored.startsWith(`/dashboard/${role}/`)) {
      return fallback
    }
    sessionStorage.removeItem(STORAGE_KEY)
    return stored
  } catch {
    return fallback
  }
}
