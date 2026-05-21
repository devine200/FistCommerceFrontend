import { Navigate, useLocation } from 'react-router-dom'

import { evaluateDashboardSession } from '@/access/evaluateAccess'
import { isSessionBootstrapping } from '@/access/sessionAccess'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import { useAccessContext } from '@/hooks/useAccessContext'
import { saveDashboardReturnTo } from '@/session/dashboardReturnTo'

/**
 * Blocks investor/merchant dashboard subtree when wallet or session token is missing.
 * Admin routes are excluded inside the evaluator.
 */
export default function DashboardSessionGuard() {
  const ctx = useAccessContext()
  const location = useLocation()
  const decision = evaluateDashboardSession(ctx)

  const restoringSession =
    isSessionBootstrapping(ctx) &&
    ctx.onboarded &&
    Boolean(ctx.role) &&
    Boolean(ctx.accessToken?.length)

  if (restoringSession) {
    return (
      <div className="fixed inset-0 z-75">
        <DashboardFullPageLoading label="Restoring your session…" />
      </div>
    )
  }

  if (!decision.allowed && decision.redirectTo) {
    saveDashboardReturnTo(`${location.pathname}${location.search}`)
    return <Navigate to={decision.redirectTo} replace />
  }

  return null
}
