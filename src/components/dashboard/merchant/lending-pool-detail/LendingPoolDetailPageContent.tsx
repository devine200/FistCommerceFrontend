import {
  displayDashboardMetricString,
  displayDashboardPercentString,
  formatDashboardCompactUsd,
  formatDashboardPercentMetric,
} from '@/api/metrics'
import LendingPoolDetailHeroBanner from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailHeroBanner'
import LendingPoolDetailOverview from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailOverview'
import MerchantLoansTable from '@/components/dashboard/merchant/lending-pool-detail/MerchantLoansTable'
import type { LendingPoolDetailConfig } from '@/components/dashboard/merchant/lending-pool-detail/types'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

interface LendingPoolDetailPageContentProps {
  config: LendingPoolDetailConfig
  poolSlug?: string
  onApplyToBorrow?: () => void
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function extractPoolItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const rec = asRecord(payload)
  const maybe = rec?.results ?? rec?.data ?? rec?.pools ?? rec?.items
  return Array.isArray(maybe) ? maybe : []
}

function findPoolMetricsBySlug(poolMetrics: unknown, slug: string | undefined): Record<string, unknown> | null {
  if (!slug) return null
  const items = extractPoolItems(poolMetrics)
  for (const item of items) {
    const rec = asRecord(item)
    if (!rec) continue
    const idRaw = rec.slug ?? rec.id ?? rec.pool_slug ?? rec.poolSlug ?? rec.pool_id ?? rec.poolId
    const id = typeof idRaw === 'string' ? idRaw.trim() : ''
    if (id && id === slug) return rec
  }
  return null
}

function fmtUsd(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) return formatDashboardCompactUsd(v)
  if (typeof v === 'string' && v.trim()) return displayDashboardMetricString(v.trim())
  return null
}

function fmtPct(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) return formatDashboardPercentMetric(v)
  if (typeof v === 'string' && v.trim()) return displayDashboardPercentString(v.trim())
  return null
}

const LendingPoolDetailPageContent = ({ config, onApplyToBorrow, poolSlug }: LendingPoolDetailPageContentProps) => {
  const navigate = useNavigate()
  const poolMetricsPayload = useAppSelector((s) => s.merchantDashboard.poolMetrics)
  const pool = findPoolMetricsBySlug(poolMetricsPayload, poolSlug)

  const stats = pool
    ? config.stats.map((s) => {
        const nextValue =
          s.label === 'Total Deposited'
            ? fmtUsd(pool.total_deposited ?? pool.totalDeposited ?? pool.total_pool_size ?? pool.totalPoolSize)
            : s.label === 'Liquid Asset'
              ? fmtUsd(pool.liquid_asset ?? pool.liquidAsset ?? pool.available_liquidity ?? pool.availableLiquidity)
              : s.label === 'Maximum loan'
                ? fmtUsd(pool.maximum_loan ?? pool.maximumLoan ?? pool.max_loan ?? pool.maxLoan)
                : s.label === 'Loan Interest'
                  ? fmtPct(pool.loan_interest ?? pool.loanInterest ?? pool.borrow_apr ?? pool.borrowApr)
                  : s.label === 'Target Repayment Duration'
                    ? (typeof (pool.target_repayment_duration ?? pool.targetRepaymentDuration) === 'string'
                        ? String(pool.target_repayment_duration ?? pool.targetRepaymentDuration)
                        : null)
                    : null
        return nextValue ? { ...s, value: nextValue } : s
      })
    : config.stats

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
        financialInfoRows={config.financialInfoRows}
        termsForLoanRows={config.termsForLoanRows}
      />
      <MerchantLoansTable loans={config.loans} />
    </div>
  )
}

export default LendingPoolDetailPageContent
