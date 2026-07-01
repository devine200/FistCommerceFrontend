import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import {
  evaluateAdminDashboardSession,
  evaluateAdminLoginPath,
  evaluateCapabilities,
  evaluateDashboardSession,
  evaluateInvestorFinancialRoute,
  evaluateMerchantFinancialRoute,
  evaluateOnboardingPath,
} from '@/access/evaluateAccess'
import { useAccessContext } from '@/hooks/useAccessContext'

/**
 * Central access decisions for guards and UI (does not navigate by itself).
 */
export function useAccessControl() {
  const ctx = useAccessContext()
  const location = useLocation()

  return useMemo(() => {
    const capabilities = evaluateCapabilities(ctx)
    const dashboard = evaluateDashboardSession(ctx)
    const adminDashboard = evaluateAdminDashboardSession(ctx)
    const adminLogin = evaluateAdminLoginPath(ctx)
    const onboardingPath = evaluateOnboardingPath(ctx)
    const investorFinancial = evaluateInvestorFinancialRoute(location.pathname, ctx)
    const merchantFinancial = evaluateMerchantFinancialRoute(location.pathname, ctx)

    return {
      ctx,
      capabilities,
      dashboard,
      adminDashboard,
      adminLogin,
      onboardingPath,
      investorFinancial,
      merchantFinancial,
    }
  }, [ctx, location.pathname])
}
