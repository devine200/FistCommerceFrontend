import { Navigate, useLocation } from 'react-router-dom'

import { evaluateDashboardSession } from '@/access/evaluateAccess'
import { isSessionBootstrapping } from '@/access/sessionAccess'
import { WALLET_SESSION_RESTORE_MS } from '@/access/walletSessionRestore'
import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import { useAccessContext } from '@/hooks/useAccessContext'
import { useDeferredAccessRedirect } from '@/hooks/useDeferredAccessRedirect'
import { saveDashboardReturnTo } from '@/session/dashboardReturnTo'

/**
 * Blocks investor/merchant dashboard subtree when wallet or session token is missing.
 * Admin routes are excluded inside the evaluator.
 */
export default function DashboardSessionGuard() {
  const ctx = useAccessContext()
  const location = useLocation()
  const decision = evaluateDashboardSession(ctx)
  const { hold, redirectTo } = useDeferredAccessRedirect(
    decision,
    ctx,
    WALLET_SESSION_RESTORE_MS,
  )

  const restoringSession =
    isSessionBootstrapping(ctx) &&
    ctx.onboarded &&
    Boolean(ctx.role) &&
    isUsableApiAccessToken(ctx.accessToken)

  if (restoringSession || hold) {
    return (
      <div className="fixed inset-0 z-75">
        <DashboardFullPageLoading label="Restoring your session…" />
      </div>
    )
  }

  // SessionExpiredModal owns recovery; hold on this route without soft-redirecting.
  if (decision.reason === 'session_expired' || ctx.sessionExpired) {
    return (
      <div className="fixed inset-0 z-75">
        <DashboardFullPageLoading label="Session expired…" />
      </div>
    )
  }

  if (!decision.allowed && redirectTo) {
    saveDashboardReturnTo(`${location.pathname}${location.search}`)
    return <Navigate to={redirectTo} replace />
  }

  return null
}
