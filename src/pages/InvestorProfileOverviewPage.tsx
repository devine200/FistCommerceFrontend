import { Outlet, useLocation } from 'react-router-dom'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import InvestorProfileOverviewContent from '@/components/dashboard/investor/profile/InvestorProfileOverviewContent'

const InvestorProfileOverviewPage = () => {
  const { pathname } = useLocation()
  const isWallets = pathname.endsWith('/wallets')
  const isHistory = pathname.endsWith('/history')
  const activeLabel = isWallets ? 'Wallets' : isHistory ? 'History' : 'Overview'
  const walletDisplay = '0x7A3F...92C1'

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Profile', to: '/dashboard/investor/profile/overview' },
    { label: activeLabel },
  ]

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
