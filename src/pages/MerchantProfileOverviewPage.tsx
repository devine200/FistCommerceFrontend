import { Outlet, useLocation } from 'react-router-dom'

import {
  MERCHANT_PROFILE_TABS,
  buildMerchantProfileStatsFromApi,
} from '@/components/dashboard/merchant/profile/merchantProfileConfig'
import MerchantProfileOverviewContent from '@/components/dashboard/merchant/profile/MerchantProfileOverviewContent'
import { buildProfileOverviewBreadcrumbs } from '@/components/dashboard/shared/dashboardBreadcrumbs'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'

const MerchantProfileOverviewPage = () => {
  const { pathname } = useLocation()
  const walletDisplay = useAppSelector((s) => s.merchantDashboard.walletDisplay)
  const merchantMetrics = useAppSelector((s) => s.merchantDashboard.merchantMetrics)

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = buildProfileOverviewBreadcrumbs(
    '/dashboard/merchant',
    pathname,
  )

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="flex flex-col gap-4 pb-8">
        <MerchantProfileOverviewContent tabs={MERCHANT_PROFILE_TABS} stats={buildMerchantProfileStatsFromApi(merchantMetrics)} />
        <Outlet />
      </div>
    </DashboardLayout>
  )
}

export default MerchantProfileOverviewPage
