import { useLayoutEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { evaluateOnboardingPath } from '@/access/evaluateAccess'
import { useAccessContext } from '@/hooks/useAccessContext'
import { useAppDispatch } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { resetOnboardingProgress } from '@/store/slices/onboardingSlice'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'
import { dashboardOverviewPath, parseUserRole } from '@/utils/userRole'

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

  // Avoid redirects while redux-persist is still restoring state (prevents flicker).
  if (!ctx.persistedReady) {
    return <Outlet />
  }

  // Onboarding should only be skipped when we have a valid dashboard session.
  // If the user is logged out (no token) but still onboarded — e.g. Privy wallet connected —
  // allow the full onboarding branch (choose-role → connect-wallet → …), not only choose-role.
  if (ctx.onboarded) {
    const normalizedRole = parseUserRole(ctx.role)
    const hasDashboardSession =
      normalizedRole !== null &&
      Boolean(ctx.walletConnected && ctx.walletAddress) &&
      Boolean(ctx.accessToken?.length)

    if (!hasDashboardSession) {
      const decision = evaluateOnboardingPath(ctx)
      if (!decision.allowed && decision.redirectTo && decision.redirectTo !== location.pathname) {
        return <Navigate to={decision.redirectTo} replace />
      }
      return <Outlet />
    }

    return <Navigate to={dashboardOverviewPath(normalizedRole)} replace />
  }

  const decision = evaluateOnboardingPath(ctx)
  if (!decision.allowed && decision.redirectTo && decision.redirectTo !== location.pathname) {
    return <Navigate to={decision.redirectTo} replace />
  }

  return <Outlet />
}
