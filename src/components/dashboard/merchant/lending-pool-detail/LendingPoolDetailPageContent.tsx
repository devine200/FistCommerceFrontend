import {
  displayDashboardCompactUsd,
  formatDashboardCompactUsd,
  formatDashboardPercentMetric,
  type PoolMetrics,
} from '@/api/metrics'
import LendingPoolDetailHeroBanner from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailHeroBanner'
import LendingPoolDetailOverview from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailOverview'
import MerchantLoansTable from '@/components/dashboard/merchant/lending-pool-detail/MerchantLoansTable'
import type { LendingPoolDetailConfig } from '@/components/dashboard/merchant/lending-pool-detail/types'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import {
  selectMerchantLoanTableRows,
  selectMerchantReceivablesError,
  selectMerchantReceivablesStatus,
} from '@/store/selectors/merchantReceivablesSelectors'

interface LendingPoolDetailPageContentProps {
  config: LendingPoolDetailConfig
  onApplyToBorrow?: () => void
}

function fmtUsd(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) return formatDashboardCompactUsd(v)
  if (typeof v === 'string' && v.trim()) return displayDashboardCompactUsd(v.trim())
  return null
}

type PoolMetricRowResolver = Record<string, (m: PoolMetrics) => string | null>

const HERO_STATS_FROM_POOL_METRICS: PoolMetricRowResolver = {
  'Total Deposited': (m) => fmtUsd(m.tvl),
  'Liquid Asset': (m) => fmtUsd(m.liquidAssets),
}

const FINANCIAL_INFO_FROM_POOL_METRICS: PoolMetricRowResolver = {
  'Available Liquidity': (m) => fmtUsd(m.availableLiquidity),
  'Total Pool Size': (m) => fmtUsd(m.tvl),
  'Average APY to Investors': (m) =>
    Number.isFinite(m.apy) ? `${formatDashboardPercentMetric(m.apy)} APY` : null,
  'Utilization Rate': (m) =>
    Number.isFinite(m.utilization) ? formatDashboardPercentMetric(m.utilization) : null,
}

function mergeRowsFromPoolMetrics<Row extends { label: string; value: string }>(
  rows: Row[],
  metrics: PoolMetrics | null,
  resolvers: PoolMetricRowResolver,
): Row[] {
  if (!metrics) return rows
  return rows.map((row) => {
    const resolver = resolvers[row.label]
    if (!resolver) return row
    const next = resolver(metrics)
    return next ? { ...row, value: next } : row
  })
}

const LendingPoolDetailPageContent = ({ config, onApplyToBorrow }: LendingPoolDetailPageContentProps) => {
  const navigate = useNavigate()
  const poolMetrics = useAppSelector((s) => s.merchantDashboard.poolMetrics)
  const loans = useAppSelector(selectMerchantLoanTableRows)
  const status = useAppSelector(selectMerchantReceivablesStatus)
  const error = useAppSelector(selectMerchantReceivablesError)

  const stats = useMemo(
    () => mergeRowsFromPoolMetrics(config.stats, poolMetrics, HERO_STATS_FROM_POOL_METRICS),
    [config.stats, poolMetrics],
  )

  const financialInfoRows = useMemo(
    () => mergeRowsFromPoolMetrics(config.financialInfoRows, poolMetrics, FINANCIAL_INFO_FROM_POOL_METRICS),
    [config.financialInfoRows, poolMetrics],
  )

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[#6B7488] text-[13px] inline-flex items-center gap-2 hover:text-[#195EBC]"
        >
          <span aria-hidden>←</span>
          Back
        </button>
      </div>
      <LendingPoolDetailHeroBanner
        title={config.title}
        subtitle={config.subtitle}
        stats={stats}
        onApplyToBorrow={onApplyToBorrow}
      />
      <LendingPoolDetailOverview
        overviewParagraphs={config.overviewParagraphs}
        financialInfoRows={financialInfoRows}
        termsForLoanRows={config.termsForLoanRows}
      />
      <MerchantLoansTable loans={loans} status={status} error={error} />
    </div>
  )
}

export default LendingPoolDetailPageContent
