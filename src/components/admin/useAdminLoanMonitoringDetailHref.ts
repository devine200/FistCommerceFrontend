import { useLocation } from 'react-router-dom'

import { adminLoanMonitoringDetailHref } from '@/components/admin/loan-monitoring'

export function useAdminLoanMonitoringDetailHref() {
  const location = useLocation()
  const returnTo = `${location.pathname}${location.search}`
  return (loanId: string, focus?: 'funding-approval' | 'funding-payout') =>
    adminLoanMonitoringDetailHref(loanId, returnTo, focus)
}
