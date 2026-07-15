import { useLayoutEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { evaluateOnboardingPath } from '@/access/evaluateAccess'
import { hasDashboardSession, isSessionBootstrapping } from '@/access/sessionAccess'
import { ONBOARDING_DASHBOARD_HANDOFF_MS } from '@/access/walletSessionRestore'
import { isAdminSession } from '@/auth/adminSession'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import { useAccessContext } from '@/hooks/useAccessContext'
import { useStableDashboardHandoff } from '@/hooks/useStableDashboardHandoff'
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
  const normalizedRole = parseUserRole(ctx.role)
  const sessionBootstrapping = isSessionBootstrapping(ctx)

  const canHandoffToDashboard =
    ctx.persistedReady &&
    !sessionBootstrapping &&
    !ctx.sessionExpired &&
    ctx.onboarded &&
    !isAdminSession(ctx.accessToken, ctx.sessionKind) &&
    hasDashboardSession(ctx) &&
    Boolean(normalizedRole)

  const handoffReady = useStableDashboardHandoff(canHandoffToDashboard, ONBOARDING_DASHBOARD_HANDOFF_MS)

  useLayoutEffect(() => {
    const decision = evaluateOnboardingPath(ctx)
    if (!decision.allowed && decision.reason === 'role_mismatch') {
      dispatch(resetOnboardingProgress())
      dispatch(resetOnboardingProfileDrafts())
      // Clear role mismatch without wiping API tokens mid-onboarding (avoids silent re-login).
      dispatch(patchAuth({ role: null }))
    }
  }, [ctx, dispatch])

  if (!ctx.persistedReady || sessionBootstrapping) {
    return <Outlet />
  }

  if (handoffReady && normalizedRole) {
    return <Navigate to={resolveDashboardReturnTo(normalizedRole)} replace />
  }

  if (canHandoffToDashboard) {
    return (
      <div className="flex min-h-[240px] w-full items-center justify-center">
        <DashboardFullPageLoading label="Opening your dashboard…" />
      </div>
    )
  }

  if (ctx.onboarded && !isAdminSession(ctx.accessToken, ctx.sessionKind)) {
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
