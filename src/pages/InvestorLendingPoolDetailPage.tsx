import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { getInvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailConfig'
import {
  mergeInvestorPoolDetailWithMetrics,
  mergeInvestorPoolPayoutIntoConfig,
} from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailFromMetrics'
import InvestorLendingPoolDetailPageContent from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolDetailPageContent'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { useListPageState } from '@/hooks/useListPageState'
import { useInvestorOnChainBalances } from '@/hooks/useInvestorOnChainBalances'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import { refreshInvestorDashboard } from '@/store/slices/investorDashboardSlice'
import {
  recentTransactionsListCacheKey,
  refreshRecentTransactions,
} from '@/store/slices/recentTransactionsSlice'
import { getListPaginationMeta, listPaginationOffset } from '@/utils/listPagination'
import { dashboardHomePath } from '@/utils/userRole'
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
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const isKycVerified = useAppSelector(selectIsKycVerified)
  const { investmentBalanceDisplay } = useInvestorOnChainBalances()
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)
  const [page, setPage] = useListPageState([])

  const offset = listPaginationOffset(page)
  const pageQuery = useMemo(
    () => ({
      limit: DASHBOARD_LIST_PAGE_SIZE,
      offset,
    }),
    [offset],
  )
  const pageCacheKey = recentTransactionsListCacheKey(pageQuery)
  const hasPageCache = Object.prototype.hasOwnProperty.call(recentTx.resultsCache, pageCacheKey)

  const refreshRecentPage = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshRecentTransactions({
          ...pageQuery,
          background,
        }),
      )
    },
    [dispatch, pageQuery],
  )

  useEffect(() => {
    if (!accessToken?.trim() || !isKycVerified) return
    refreshRecentPage(hasPageCache)
  }, [accessToken, isKycVerified, refreshRecentPage, hasPageCache])

  const recentPayout: RecentPayoutBundle | null = useMemo(() => {
    if (recentTx.lastUpdated == null && recentTx.status === 'idle') return null
    return {
      transactions: recentTx.items,
      contractAddress: recentTx.poolContractAddress,
      explorerBaseUrl: recentTx.explorerBaseUrl,
      total: recentTx.total,
    }
  }, [recentTx])

  const paginationMeta = useMemo(
    () => getListPaginationMeta(recentTx.total, page),
    [recentTx.total, page],
  )

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
      onChainPoolPositionDisplay: investmentBalanceDisplay,
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
    investmentBalanceDisplay,
  ])

  const poolDataLoading = Boolean(staticBase && !config && status !== 'failed')
  const poolDataFailed = Boolean(staticBase && !config && status === 'failed' && !errorDismissed)
  const recentTransactionsLoading =
    recentTx.status === 'loading' && recentTx.items.length === 0 && !hasPageCache

  const feedbackPhase = poolDataLoading && !loadingDismissed ? 'loading' : poolDataFailed ? 'failed' : 'idle'

  if (!poolSlug || !staticBase) {
    return <Navigate to={dashboardHomePath('investor', isKycVerified)} replace />
  }

  const lendingPoolsHome = dashboardHomePath('investor', isKycVerified)
  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Explore Lending Pools', to: lendingPoolsHome },
    { label: 'Lending Pool', to: lendingPoolsHome },
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
      {config ? (
        <InvestorLendingPoolDetailPageContent
          config={config}
          poolSlug={poolSlug}
          transactionsPaginationMeta={paginationMeta}
          onTransactionsPageChange={setPage}
          transactionsLoading={recentTransactionsLoading}
        />
      ) : null}
    </DashboardLayout>
  )
}

export default InvestorLendingPoolDetailPage
