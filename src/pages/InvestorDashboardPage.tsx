import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardKycGate from '@/components/dashboard/shared/DashboardKycGate'
import { buildDashboardHomeBreadcrumbs } from '@/components/dashboard/shared/dashboardBreadcrumbs'
import InvestorLendingPool from '@/components/dashboard/investor/InvestorLendingPool'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import { useSession } from '@/state/useSession'

const InvestorDashboardPage = () => {
  const { pathname } = useLocation()

  const topBarBreadcrumbs = useMemo(
    (): DashboardBreadcrumbItem[] => buildDashboardHomeBreadcrumbs(pathname, '/dashboard/investor'),
    [pathname],
  )

  const { kycVerified: isKycVerified } = useSession()
  const walletDisplay = useAppSelector((s) => s.investorDashboard.walletDisplay)

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/investor"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <DashboardKycGate isKycVerified={isKycVerified} kycVariant="investor" verifiedContent={<InvestorLendingPool />} />
    </DashboardLayout>
  )
}

export default InvestorDashboardPage
