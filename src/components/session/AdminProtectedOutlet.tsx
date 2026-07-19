import { Navigate, Outlet } from 'react-router-dom'

import { evaluateAdminDashboardSession } from '@/access/evaluateAccess'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import { useAccessContext } from '@/hooks/useAccessContext'

/**
 * Renders child admin routes only when persisted auth is an admin session.
 * Otherwise redirects to admin login (or shows loading while rehydrating).
 * Session-expired recovery is owned by SessionExpiredModal (not soft-redirect).
 */
export default function AdminProtectedOutlet() {
  const ctx = useAccessContext()

  if (!ctx.persistedReady) {
    return <DashboardFullPageLoading label="Loading admin session…" />
  }

  const decision = evaluateAdminDashboardSession(ctx)

  // SessionExpiredModal owns recovery; hold on this route without soft-redirecting.
  if (decision.reason === 'session_expired' || ctx.sessionExpired) {
    return <DashboardFullPageLoading label="Session expired…" />
  }

  if (!decision.allowed && decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />
  }

  return <Outlet />
}
