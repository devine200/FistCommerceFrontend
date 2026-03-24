import { Navigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import InvestorLendingPoolDetailPageContent from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolDetailPageContent'
import { getInvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailConfig'

const InvestorLendingPoolDetailPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const config = getInvestorPoolDetailConfig(poolSlug)

  if (!config || !poolSlug) {
    return <Navigate to="/dashboard/investor/overview" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Explore Lending Pools', to: '/dashboard/investor/overview' },
    { label: 'Lending Pool', to: '/dashboard/investor/overview' },
    { label: config.title },
  ]

  const tb = config.topBar

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/investor"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarBreadcrumbLinksMuted={Boolean(tb)}
      topBarWalletDisplay={tb?.walletDisplay}
      topBarNotificationUnread={tb?.showUnreadNotification}
    >
      <InvestorLendingPoolDetailPageContent config={config} poolSlug={poolSlug} />
    </DashboardLayout>
  )
}

export default InvestorLendingPoolDetailPage
