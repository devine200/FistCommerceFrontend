import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import {
  evaluateInvestorFinancialRoute,
  evaluateMerchantFinancialRoute,
} from '@/access/evaluateAccess'
import { useAccessContext } from '@/hooks/useAccessContext'

/** Wraps invest / withdraw / apply-loan / repay routes — KYC must be verified (or legacy flag). */
export default function KycFinancialRoutesGuard({ children }: { children: ReactNode }) {
  const ctx = useAccessContext()
  const location = useLocation()
  const inv = evaluateInvestorFinancialRoute(location.pathname, ctx)
  if (!inv.allowed && inv.redirectTo) {
    return <Navigate to={inv.redirectTo} replace state={{ kycRequired: true }} />
  }
  const mer = evaluateMerchantFinancialRoute(location.pathname, ctx)
  if (!mer.allowed && mer.redirectTo) {
    return <Navigate to={mer.redirectTo} replace state={{ kycRequired: true }} />
  }
  return <>{children}</>
}
