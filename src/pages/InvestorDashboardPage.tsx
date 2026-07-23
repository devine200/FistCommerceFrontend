import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardKycGate from '@/components/dashboard/shared/DashboardKycGate'
import { buildDashboardHomeBreadcrumbs } from '@/components/dashboard/shared/dashboardBreadcrumbs'
import InvestorLendingPool from '@/components/dashboard/investor/InvestorLendingPool'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import { selectInvestorWalletDisplay } from '@/store/selectors/investorDashboardSelectors'
import { useSession } from '@/state/useSession'

const InvestorDashboardPage = () => {
  const { pathname } = useLocation()
  const { kycVerified: isKycVerified } = useSession()

  const topBarBreadcrumbs = useMemo(
    (): DashboardBreadcrumbItem[] =>
      buildDashboardHomeBreadcrumbs(pathname, '/dashboard/investor', isKycVerified),
    [pathname, isKycVerified],
  )
  const walletDisplay = useAppSelector(selectInvestorWalletDisplay)

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
