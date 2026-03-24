import { Navigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import InvestorLendingPoolHowItWorksPageContent from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolHowItWorksPageContent'
import { getInvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailConfig'

const InvestorLendingPoolHowItWorksPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const config = getInvestorPoolDetailConfig(poolSlug)

  if (!config || !poolSlug) {
    return <Navigate to="/dashboard/investor/overview" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Lending Pool', to: '/dashboard/investor/overview' },
    { label: 'Lending Pool', to: `/dashboard/investor/lending-pool/${poolSlug}` },
    { label: 'How it works' },
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
      <InvestorLendingPoolHowItWorksPageContent />
    </DashboardLayout>
  )
}

export default InvestorLendingPoolHowItWorksPage
