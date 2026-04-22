import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { getInvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailConfig'
import {
  mergeInvestorPoolDetailWithMetrics,
  mergeInvestorPoolPayoutIntoConfig,
} from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailFromMetrics'
import InvestorLendingPoolDetailPageContent from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolDetailPageContent'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import type { RecentPayoutBundle } from '@/api/payout'

const InvestorLendingPoolDetailPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const poolMetrics = useAppSelector((s) => s.investorDashboard.poolMetrics)
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)
  const status = useAppSelector((s) => s.investorDashboard.status)
  const walletAddress = useAppSelector((s) => s.wallet.address)
  const walletDisplayFallback = useAppSelector((s) => s.investorDashboard.walletDisplay)
  const recentTx = useAppSelector((s) => s.recentTransactions)
  const recentPayout: RecentPayoutBundle | null = useMemo(() => {
    if (recentTx.lastUpdated == null) return null
    return {
      transactions: recentTx.items,
      contractAddress: recentTx.poolContractAddress,
      explorerBaseUrl: recentTx.explorerBaseUrl,
    }
  }, [recentTx])

  const staticBase = useMemo(
    () => getInvestorPoolDetailConfig(poolSlug, { dashboardPoolId: lendingPool.id }),
    [poolSlug, lendingPool.id],
  )

  const config = useMemo(() => {
    if (!staticBase || !poolMetrics || !investorMetrics) return null
    const withMetrics = mergeInvestorPoolDetailWithMetrics(staticBase, {
      lendingPool,
      poolMetrics,
      investorMetrics,
      walletAddress,
      walletDisplayFallback,
    })
    return mergeInvestorPoolPayoutIntoConfig(withMetrics, recentPayout)
  }, [
    staticBase,
    lendingPool,
    poolMetrics,
    investorMetrics,
    walletAddress,
    walletDisplayFallback,
    recentPayout,
  ])

  if (!poolSlug || !staticBase) {
    return <Navigate to="/dashboard/investor/overview" replace />
  }

  if (!config) {
    if (status === 'failed') {
      return <Navigate to="/dashboard/investor/overview" replace />
    }
    return (
      <div className="fixed inset-0 z-75">
        <DashboardFullPageLoading label="Loading pool…" />
      </div>
    )
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
      topBarNotificationUnread={tb?.showUnreadNotification ?? false}
    >
      <InvestorLendingPoolDetailPageContent config={config} poolSlug={poolSlug} />
    </DashboardLayout>
  )
}

export default InvestorLendingPoolDetailPage
