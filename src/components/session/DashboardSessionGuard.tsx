import { Navigate, useLocation } from 'react-router-dom'

import { evaluateDashboardSession } from '@/access/evaluateAccess'
import { isSessionBootstrapping } from '@/access/sessionAccess'
import { WALLET_SESSION_RESTORE_MS } from '@/access/walletSessionRestore'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import { useAccessContext } from '@/hooks/useAccessContext'
import { useDeferredAccessRedirect } from '@/hooks/useDeferredAccessRedirect'
import { saveDashboardReturnTo } from '@/session/dashboardReturnTo'
import { recordSessionDiagnostic } from '@/session/sessionDiagnostics'

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
    Boolean(ctx.accessToken?.length)

  if (restoringSession || hold) {
    return (
      <div className="fixed inset-0 z-75">
        <DashboardFullPageLoading label="Restoring your session…" />
      </div>
    )
  }

  if (!decision.allowed && redirectTo) {
    recordSessionDiagnostic({
      event: 'dashboard_guard_navigate',
      pathname: location.pathname,
      reason: decision.reason,
      redirectTo,
      walletConnected: ctx.walletConnected,
      privyReady: ctx.privyReady,
      walletsReady: ctx.walletsReady,
      onboarded: ctx.onboarded,
      role: ctx.role,
      hasAccessToken: Boolean(ctx.accessToken?.length),
    })
    saveDashboardReturnTo(`${location.pathname}${location.search}`)
    return <Navigate to={redirectTo} replace />
  }

  return null
}
