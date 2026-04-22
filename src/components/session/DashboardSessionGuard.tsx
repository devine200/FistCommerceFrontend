import { Navigate, useLocation } from 'react-router-dom'

import { evaluateDashboardSession } from '@/access/evaluateAccess'
import { useAccessContext } from '@/hooks/useAccessContext'

/**
 * Blocks investor/merchant dashboard subtree when wallet or session token is missing.
 * Admin routes are excluded inside the evaluator.
 */
export default function DashboardSessionGuard() {
  const ctx = useAccessContext()
  const location = useLocation()
  const decision = evaluateDashboardSession(ctx)

  if (!decision.allowed && decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace state={{ from: location.pathname }} />
  }

  return null
}
