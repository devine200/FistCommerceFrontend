import { Outlet, useLocation } from 'react-router-dom'

import { buildProfileOverviewBreadcrumbs } from '@/components/dashboard/shared/dashboardBreadcrumbs'
import InvestorProfileOverviewContent from '@/components/dashboard/investor/profile/InvestorProfileOverviewContent'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'

const InvestorProfileOverviewPage = () => {
  const { pathname } = useLocation()
  const walletDisplay = useAppSelector((s) => s.investorDashboard.walletDisplay)

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = buildProfileOverviewBreadcrumbs(
    '/dashboard/investor',
    pathname,
  )

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/investor"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="flex flex-col gap-4 pb-8">
        <InvestorProfileOverviewContent />
        <Outlet />
      </div>
    </DashboardLayout>
  )
}

export default InvestorProfileOverviewPage
