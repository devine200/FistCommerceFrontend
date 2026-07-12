import { useLayoutEffect, useRef } from 'react'
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
import { recordSessionDiagnostic } from '@/session/sessionDiagnostics'
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
  const handoffLoggedRef = useRef(false)

  const canHandoffToDashboard =
    ctx.persistedReady &&
    !sessionBootstrapping &&
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
      dispatch(patchAuth({ role: null, accessToken: null, refreshToken: null }))
    }
  }, [ctx, dispatch])

  if (!ctx.persistedReady || sessionBootstrapping) {
    return <Outlet />
  }

  if (handoffReady && normalizedRole) {
    const to = resolveDashboardReturnTo(normalizedRole)
    if (!handoffLoggedRef.current) {
      handoffLoggedRef.current = true
      recordSessionDiagnostic({
        event: 'onboarding_handoff',
        pathname: location.pathname,
        redirectTo: to,
        walletConnected: ctx.walletConnected,
        privyReady: ctx.privyReady,
        walletsReady: ctx.walletsReady,
        onboarded: ctx.onboarded,
        role: normalizedRole,
        hasAccessToken: Boolean(ctx.accessToken?.length),
      })
    }
    return <Navigate to={to} replace />
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
