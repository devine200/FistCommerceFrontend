import type { AdminRepaymentApi } from '@/api/adminLoan'
import {
  displayDashboardCompactUsd,
  displayDashboardMetricString,
  displayPoolApyPercent,
  displayPoolUtilization,
  formatDashboardPercentMetric,
  type AdminChartHistory,
  type AdminMetrics,
} from '@/api/metrics'
import adminIconDollar1 from '@/assets/admin-icon-dollar-1.png'
import adminIconDollar2 from '@/assets/admin-icon-dollar-2.png'
import adminIconCoin from '@/assets/admin-icon-coin.png'
import moneyIcon from '@/assets/Money.png'
import adminActivityRepayment from '@/assets/admin-activity-repayment.png'
import type { AdminActivityRow, AdminMetricCard } from '@/store/slices/adminDashboardSlice'

function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/** Overview stat cards aligned with `GET /api/metrics/admin/` field names. */
export function adminMetricsToMetricCards(metrics: AdminMetrics): AdminMetricCard[] {
  const { capital, credit, risk } = metrics
  return [
    {
      title: 'TVL',
      value: displayDashboardCompactUsd(capital.tvl),
      iconSrc: adminIconDollar1,
    },
    {
      title: 'Active loans',
      value: formatCount(credit.activeLoans),
      iconSrc: adminIconCoin,
    },
    {
      title: 'Utilization',
      value: displayPoolUtilization(capital.utilization),
      iconSrc: adminIconDollar2,
    },
    {
      title: 'Protocol APY',
      value: displayPoolApyPercent(capital.apy),
      iconSrc: moneyIcon,
    },
    {
      title: 'Originated principal',
      value: displayDashboardCompactUsd(credit.originatedPrincipal),
      iconSrc: adminIconDollar1,
    },
    {
      title: 'Repaid principal',
      value: displayDashboardCompactUsd(credit.repaidPrincipal),
      iconSrc: adminIconCoin,
    },
    {
      title: 'Default rate',
      value: formatDashboardPercentMetric(credit.defaultRate),
      iconSrc: adminIconDollar2,
    },
    {
      title: 'Impaired',
      value: displayDashboardCompactUsd(risk.impaired),
      iconSrc: moneyIcon,
    },
  ]
}

export const PLACEHOLDER_ADMIN_METRIC_CARDS: AdminMetricCard[] = [
  { title: 'TVL', value: '—', iconSrc: adminIconDollar1 },
  { title: 'Active loans', value: '—', iconSrc: adminIconCoin },
  { title: 'Utilization', value: '—', iconSrc: adminIconDollar2 },
  { title: 'Protocol APY', value: '—', iconSrc: moneyIcon },
  { title: 'Originated principal', value: '—', iconSrc: adminIconDollar1 },
  { title: 'Repaid principal', value: '—', iconSrc: adminIconCoin },
  { title: 'Default rate', value: '—', iconSrc: adminIconDollar2 },
  { title: 'Impaired', value: '—', iconSrc: moneyIcon },
]

function formatAdminActivityDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.trim() || '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function repaymentActivityTitle(eventType: string): string {
  const t = eventType.trim().toLowerCase()
  if (t.includes('repay')) return 'Repayment received'
  return 'Payout event'
}

function shortReceivableId(receivableId: string): string {
  const id = receivableId.trim()
  if (id.length <= 14) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export function adminRepaymentsToActivityRows(repayments: AdminRepaymentApi[]): AdminActivityRow[] {
  return repayments.map((row) => {
    const amount =
      row.amount_eth?.trim() ||
      displayDashboardMetricString(row.amount)
    const receivable = shortReceivableId(row.receivable_id)
    return {
      title: repaymentActivityTitle(row.event_type),
      subtitle: `${amount} · Receivable ${receivable}`,
      date: formatAdminActivityDate(row.created_at),
      iconSrc: adminActivityRepayment,
      iconBgClass: 'bg-[#F3F7FC]',
    }
  })
}

export type AdminChartRechartsPoint = {
  month: string
  value: number
  rawAmount: string | null
}

export function adminChartHistoryToRechartsData(
  history: AdminChartHistory | null,
  amountKey: 'tvl' | 'principal',
): AdminChartRechartsPoint[] {
  if (!history?.series.length) return []
  return history.series.map((point) => ({
    month: point.label || point.month,
    value: point.value,
    rawAmount: amountKey === 'tvl' ? (point.tvl ?? null) : (point.principal ?? null),
  }))
}

/** Y-axis max for million-scale charts with headroom. */
export function chartYAxisMaxMillions(points: AdminChartRechartsPoint[]): number {
  const max = Math.max(0, ...points.map((p) => p.value))
  if (max <= 0) return 1
  const padded = max * 1.15
  if (padded <= 1) return 1
  if (padded <= 5) return Math.ceil(padded)
  return Math.ceil(padded / 5) * 5
}
