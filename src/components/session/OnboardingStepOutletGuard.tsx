import { useLayoutEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { evaluateOnboardingPath } from '@/access/evaluateAccess'
import { hasDashboardSession, isSessionBootstrapping } from '@/access/sessionAccess'
import { isAdminSession } from '@/auth/adminSession'
import { useAccessContext } from '@/hooks/useAccessContext'
import { useAppDispatch } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { resetOnboardingProgress } from '@/store/slices/onboardingSlice'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'
import { resolveDashboardReturnTo } from '@/session/dashboardReturnTo'
import { parseUserRole } from '@/utils/userRole'

/**
 * Skips onboarding when already complete; prevents deep-linking ahead in the stepper.
 * Renders the active onboarding child route when allowed.
 */
export default function OnboardingStepOutletGuard() {
  const dispatch = useAppDispatch()
  const ctx = useAccessContext()
  const location = useLocation()

  useLayoutEffect(() => {
    const decision = evaluateOnboardingPath(ctx)
    if (!decision.allowed && decision.reason === 'role_mismatch') {
      dispatch(resetOnboardingProgress())
      dispatch(resetOnboardingProfileDrafts())
      dispatch(patchAuth({ role: null, accessToken: null, refreshToken: null }))
    }
  }, [ctx, dispatch])

  if (!ctx.persistedReady || isSessionBootstrapping(ctx)) {
    return <Outlet />
  }

  if (ctx.onboarded && !isAdminSession(ctx.accessToken, ctx.sessionKind)) {
    const normalizedRole = parseUserRole(ctx.role)

    if (hasDashboardSession(ctx) && normalizedRole) {
      return <Navigate to={resolveDashboardReturnTo(normalizedRole)} replace />
    }

    const decision = evaluateOnboardingPath(ctx)
    if (!decision.allowed && decision.redirectTo && decision.redirectTo !== location.pathname) {
      return <Navigate to={decision.redirectTo} replace />
    }
    return <Outlet />
  }

  const decision = evaluateOnboardingPath(ctx)
  if (!decision.allowed && decision.redirectTo && decision.redirectTo !== location.pathname) {
    return <Navigate to={decision.redirectTo} replace />
  }

  return <Outlet />
}
