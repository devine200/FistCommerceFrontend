import { Navigate } from 'react-router-dom'

import InvestorDashboardPage from '@/pages/InvestorDashboardPage'
import MerchantDashboardPage from '@/pages/MerchantDashboardPage'
import { useAppSelector } from '@/store/hooks'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import type { UserRole } from '@/store/slices/authSlice'
import { dashboardHomePath } from '@/utils/userRole'

export function DashboardOverviewRoute({ role }: { role: UserRole }) {
  const isKycVerified = useAppSelector(selectIsKycVerified)
  if (isKycVerified) {
    return <Navigate to={dashboardHomePath(role, true)} replace />
  }
  return role === 'investor' ? <InvestorDashboardPage /> : <MerchantDashboardPage />
}

export function DashboardRoleIndexRedirect({ role: _role }: { role: UserRole }) {
  const isKycVerified = useAppSelector(selectIsKycVerified)
  return <Navigate to={isKycVerified ? 'opportunities' : 'overview'} replace />
}

export function DashboardRoleFallbackRedirect({ role }: { role: UserRole }) {
  const isKycVerified = useAppSelector(selectIsKycVerified)
  return <Navigate to={dashboardHomePath(role, isKycVerified)} replace />
}
