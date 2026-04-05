import { Outlet, useLocation } from 'react-router-dom'

import {
  MERCHANT_PROFILE,
  MERCHANT_PROFILE_STATS,
  MERCHANT_PROFILE_TABS,
} from '@/components/dashboard/merchant/profile/merchantProfileConfig'
import MerchantProfileOverviewContent from '@/components/dashboard/merchant/profile/MerchantProfileOverviewContent'
import { buildProfileOverviewBreadcrumbs } from '@/components/dashboard/shared/dashboardBreadcrumbs'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'

const MerchantProfileOverviewPage = () => {
  const { pathname } = useLocation()
  const walletDisplay = '0x7A3F...92C1'

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
        <MerchantProfileOverviewContent
          name={MERCHANT_PROFILE.name}
          email={MERCHANT_PROFILE.email}
          stats={MERCHANT_PROFILE_STATS}
          tabs={MERCHANT_PROFILE_TABS}
        />
        <Outlet />
      </div>
    </DashboardLayout>
  )
}

export default MerchantProfileOverviewPage
