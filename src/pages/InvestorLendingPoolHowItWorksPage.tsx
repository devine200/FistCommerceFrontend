import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { resolveInvestorPoolLayoutMeta } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailFromMetrics'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import InvestorLendingPoolHowItWorksPageContent from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolHowItWorksPageContent'
import { useAppSelector } from '@/store/hooks'

const InvestorLendingPoolHowItWorksPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const walletAddress = useAppSelector((s) => s.wallet.address)
  const walletDisplayFallback = useAppSelector((s) => s.investorDashboard.walletDisplay)

  const layout = useMemo(
    () => resolveInvestorPoolLayoutMeta(poolSlug, lendingPool, walletAddress, walletDisplayFallback),
    [poolSlug, lendingPool, walletAddress, walletDisplayFallback],
  )

  if (!layout.ok || !poolSlug) {
    return <Navigate to="/dashboard/investor/overview" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Lending Pool', to: '/dashboard/investor/overview' },
    { label: 'Lending Pool', to: `/dashboard/investor/lending-pool/${poolSlug}` },
    { label: 'How it works' },
  ]

  const tb = layout.topBar

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/investor"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarBreadcrumbLinksMuted={Boolean(tb)}
      topBarWalletDisplay={tb?.walletDisplay}
      topBarNotificationUnread={tb?.showUnreadNotification ?? false}
    >
      <InvestorLendingPoolHowItWorksPageContent />
    </DashboardLayout>
  )
}

export default InvestorLendingPoolHowItWorksPage
