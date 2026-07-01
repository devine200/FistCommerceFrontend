import { useLocation } from 'react-router-dom'

import { SupportContactContent } from '@/components/dashboard/shared/SupportContactContent'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'

const DashboardSupportContactPage = () => {
  const { pathname } = useLocation()
  const isMerchant = pathname.startsWith('/dashboard/merchant')
  const dashboardBasePath = isMerchant ? '/dashboard/merchant' : '/dashboard/investor'
  const walletDisplay = useAppSelector((s) =>
    isMerchant ? s.merchantDashboard.walletDisplay : s.investorDashboard.walletDisplay,
  )

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Dashboard', to: `${dashboardBasePath}/overview` },
    { label: 'Support' },
  ]

  return (
    <DashboardLayout
      dashboardBasePath={dashboardBasePath}
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <SupportContactContent />
    </DashboardLayout>
  )
}

export default DashboardSupportContactPage
