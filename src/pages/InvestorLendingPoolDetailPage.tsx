import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { getInvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailConfig'
import {
  mergeInvestorPoolDetailWithMetrics,
  mergeInvestorPoolPayoutIntoConfig,
} from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailFromMetrics'
import InvestorLendingPoolDetailPageContent from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolDetailPageContent'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshInvestorDashboard } from '@/store/slices/investorDashboardSlice'
import type { RecentPayoutBundle } from '@/api/payout'

const InvestorLendingPoolDetailPage = () => {
  const dispatch = useAppDispatch()
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const poolMetrics = useAppSelector((s) => s.investorDashboard.poolMetrics)
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)
  const status = useAppSelector((s) => s.investorDashboard.status)
  const error = useAppSelector((s) => s.investorDashboard.error)
  const walletAddress = useAppSelector((s) => s.wallet.address)
  const walletDisplayFallback = useAppSelector((s) => s.investorDashboard.walletDisplay)
  const recentTx = useAppSelector((s) => s.recentTransactions)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)

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

  const poolDataLoading = Boolean(staticBase && !config && status !== 'failed')
  const poolDataFailed = Boolean(staticBase && !config && status === 'failed' && !errorDismissed)

  const feedbackPhase = poolDataLoading && !loadingDismissed ? 'loading' : poolDataFailed ? 'failed' : 'idle'

  if (!poolSlug || !staticBase) {
    return <Navigate to="/dashboard/investor/overview" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Explore Lending Pools', to: '/dashboard/investor/overview' },
    { label: 'Lending Pool', to: '/dashboard/investor/overview' },
    { label: staticBase.title },
  ]

  const tb = config?.topBar

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/investor"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarBreadcrumbLinksMuted={Boolean(tb)}
      topBarWalletDisplay={tb?.walletDisplay}
      topBarNotificationUnread={tb?.showUnreadNotification ?? false}
    >
      <DashboardRequestFeedbackLayer
        phase={feedbackPhase}
        loadingTitle="Loading lending pool"
        loadingDescription="Fetching pool metrics and your investment data…"
        errorTitle="Unable to load lending pool"
        errorDescription={error ?? undefined}
        onDismiss={() => setErrorDismissed(true)}
        onRetry={() => {
          setErrorDismissed(false)
          void dispatch(refreshInvestorDashboard())
        }}
        onCancelLoading={() => setLoadingDismissed(true)}
      />
      {config ? <InvestorLendingPoolDetailPageContent config={config} poolSlug={poolSlug} /> : null}
    </DashboardLayout>
  )
}

export default InvestorLendingPoolDetailPage
