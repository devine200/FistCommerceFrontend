import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardKycGate from '@/components/dashboard/shared/DashboardKycGate'
import { buildDashboardHomeBreadcrumbs } from '@/components/dashboard/shared/dashboardBreadcrumbs'
import MerchantLendingPool from '@/components/dashboard/merchant/MerchantLendingPool'
import MerchantAllReceivablesContent from '@/components/dashboard/merchant/receivables/MerchantAllReceivablesContent'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import { useSession } from '@/state/useSession'

const MerchantDashboardPage = () => {
  const { pathname } = useLocation()

  const topBarBreadcrumbs = useMemo(
    (): DashboardBreadcrumbItem[] => buildDashboardHomeBreadcrumbs(pathname, '/dashboard/merchant'),
    [pathname],
  )

  const { kycVerified: isKycVerified } = useSession()
  const walletDisplay = useAppSelector((s) => s.merchantDashboard.walletDisplay)

  const verifiedContent = pathname.includes('/receivables') ? (
    <MerchantAllReceivablesContent />
  ) : (
    <MerchantLendingPool />
  )

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <DashboardKycGate isKycVerified={isKycVerified} kycVariant="merchant" verifiedContent={verifiedContent} />
    </DashboardLayout>
  )
}

export default MerchantDashboardPage
