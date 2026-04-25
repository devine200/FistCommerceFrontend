import { useLayoutEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { evaluateOnboardingPath } from '@/access/evaluateAccess'
import { useAccessContext } from '@/hooks/useAccessContext'
import { useAppDispatch } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { resetOnboardingProgress } from '@/store/slices/onboardingSlice'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'

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
  // If the user disconnected (or reloaded without a token/wallet), keep them in onboarding.
  if (ctx.onboarded) {
    const hasDashboardSession =
      Boolean(ctx.role) && Boolean(ctx.walletConnected && ctx.walletAddress) && Boolean(ctx.accessToken?.length)

    if (!hasDashboardSession) {
      return <Navigate to="/onboarding/choose-role" replace />
    }

    return <Navigate to={`/dashboard/${ctx.role}/overview`} replace />
  }

  const decision = evaluateOnboardingPath(ctx)
  if (!decision.allowed && decision.redirectTo && decision.redirectTo !== location.pathname) {
    return <Navigate to={decision.redirectTo} replace />
  }

  return <Outlet />
}
