import {
  displayDashboardCompactUsd,
  formatDashboardCompactUsd,
  formatDashboardPercentMetric,
} from '@/api/metrics'
import type { MerchantLoanApi } from '@/api/loans'
import LendingPoolDetailHeroBanner from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailHeroBanner'
import LendingPoolDetailOverview from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailOverview'
import MerchantLoansTable from '@/components/dashboard/merchant/lending-pool-detail/MerchantLoansTable'
import type { LendingPoolDetailConfig, MerchantLoanTableRowData } from '@/components/dashboard/merchant/lending-pool-detail/types'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

interface LendingPoolDetailPageContentProps {
  config: LendingPoolDetailConfig
  onApplyToBorrow?: () => void
}

function fmtUsd(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) return formatDashboardCompactUsd(v)
  if (typeof v === 'string' && v.trim()) return displayDashboardCompactUsd(v.trim())
  return null
}

function fmtDdMmYyyy(isoLike: string): string {
  const d = new Date(isoLike)
  if (!Number.isFinite(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}-${mm}-${yyyy}`
}

function loanStatusLabel(statusRaw: string): string {
  const s = (statusRaw ?? '').trim().toLowerCase()
  if (!s) return 'Unpaid'
  if (s.includes('repaid') || s.includes('paid') || s === 'completed') return 'Repaid'
  if (s.includes('default')) return 'Defaulted'
  return 'Unpaid'
}

function loanApiToMerchantLoanRow(loan: MerchantLoanApi): MerchantLoanTableRowData {
  return {
    id: loan.id,
    merchantName: `Merchant ${loan.user ?? loan.id.slice(0, 6)}`,
    walletShort: '—',
    loanAmount: displayDashboardCompactUsd(loan.loan_amount),
    issueDate: fmtDdMmYyyy(loan.created_at),
    repaymentDue: '—',
    repaymentAmount: '—',
    debtStatus: loanStatusLabel(loan.status),
  }
}

const LendingPoolDetailPageContent = ({ config, onApplyToBorrow }: LendingPoolDetailPageContentProps) => {
  const navigate = useNavigate()
  const poolMetrics = useAppSelector((s) => s.merchantDashboard.poolMetrics)
  const { loans: merchantLoansApi, status: merchantLoansStatus, error: merchantLoansError } = useAppSelector(
    (s) => s.merchantReceivables,
  )

  const stats = poolMetrics
    ? config.stats.map((s) => {
        const nextValue =
          s.label === 'Total Deposited'
            ? fmtUsd(poolMetrics.tvl)
            : s.label === 'Liquid Asset'
              ? fmtUsd(poolMetrics.liquidAssets)
              : s.label === 'Maximum loan'
                ? null
                : s.label === 'Loan Interest'
                  ? null
                  : s.label === 'Target Repayment Duration'
                    ? null
                    : null
        return nextValue ? { ...s, value: nextValue } : s
      })
    : config.stats

  const financialInfoRows = poolMetrics
    ? config.financialInfoRows.map((row) => {
        const nextValue =
          row.label === 'Available Liquidity'
            ? fmtUsd(poolMetrics.availableLiquidity)
            : row.label === 'Total Pool Size'
              ? fmtUsd(poolMetrics.tvl)
              : row.label === 'Average APY to Investors'
                ? (Number.isFinite(poolMetrics.apy) ? `${formatDashboardPercentMetric(poolMetrics.apy)} APY` : null)
                : row.label === 'Utilization Rate'
                  ? (Number.isFinite(poolMetrics.utilization)
                      ? formatDashboardPercentMetric(poolMetrics.utilization)
                      : null)
                  : null
        return nextValue ? { ...row, value: nextValue } : row
      })
    : config.financialInfoRows

  const merchantLoanRows =
    merchantLoansApi.length > 0 ? merchantLoansApi.map(loanApiToMerchantLoanRow) : config.loans

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
      {merchantLoansStatus === 'loading' ? (
        <div className="text-[#8B92A3] text-[13px] px-1" role="status">
          Loading merchant loans…
        </div>
      ) : null}
      {merchantLoansStatus === 'failed' && merchantLoansError?.trim() ? (
        <div className="text-[#B91C1C] text-[13px] px-1" role="alert">
          {merchantLoansError.trim()}
        </div>
      ) : null}
      <MerchantLoansTable loans={merchantLoanRows} />
    </div>
  )
}

export default LendingPoolDetailPageContent
