import { displayDashboardMetricString } from '@/api/metrics'
import type { LoanDetailsResponse } from '@/api/loanDetails'
import { INVESTMENT_POOL } from '@/components/dashboard/investor/invest/config'
import type { ReceivableDetailView } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'
import { calculateLoanTierFigures, formatLoanCurrency } from '@/utils/loanTierCalculations'

export type MerchantRepayReviewBreakdown = {
  subtitle: string
  principalDue: string
  interestDue: string
  lateFeesDue: string
  /** When null, the platform fee row is hidden. */
  platformFee: string | null
  totalOwed: string
  lendingPoolName: string
  aprLabel: string
}

const EMPTY_BREAKDOWN: MerchantRepayReviewBreakdown = {
  subtitle: '—',
  principalDue: '—',
  interestDue: '—',
  lateFeesDue: '—',
  platformFee: null,
  totalOwed: '—',
  lendingPoolName: INVESTMENT_POOL.name,
  aprLabel: '—',
}

export function parseMoneyToHuman(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function formatMoneyLabel(raw: string | null | undefined, amount: number | null | undefined): string {
  if (amount != null && Number.isFinite(amount)) return formatLoanCurrency(amount)
  if (!raw?.trim()) return '—'
  const formatted = displayDashboardMetricString(raw)
  if (formatted !== '—') return formatted
  const parsed = parseMoneyToHuman(raw)
  return parsed != null ? formatLoanCurrency(parsed) : '—'
}

function formatAprLabel(apr: number | null | undefined): string {
  if (apr == null || !Number.isFinite(apr)) return '—'
  return `${apr.toLocaleString('en-US', { maximumFractionDigits: 2 })}% APR`
}

function buildSubtitle(api: LoanDetailsResponse): string {
  const progress = api.repaymentDetails.progress.label?.trim()
  if (progress) return progress
  const structure = api.repaymentDetails.repaymentStructure?.trim()
  if (structure) return structure
  if (api.summary.apr != null && Number.isFinite(api.summary.apr)) return formatAprLabel(api.summary.apr)
  return '—'
}

function resolvePrincipalAndInterest(api: LoanDetailsResponse): {
  principal: number | null
  interest: number | null
  totalOwed: number | null
} {
  const principalRaw =
    parseMoneyToHuman(api.summary.funding) ??
    parseMoneyToHuman(api.summary.totalAmount)
  const owedFromApi = parseMoneyToHuman(api.summary.amountOwed)

  const durationDays = api.repaymentDetails.loanDurationDays
  const apr = api.summary.apr

  let interest: number | null = null
  let calculatedTotal: number | null = null

  if (
    principalRaw != null &&
    principalRaw > 0 &&
    durationDays != null &&
    durationDays > 0 &&
    apr != null &&
    Number.isFinite(apr)
  ) {
    const figures = calculateLoanTierFigures(principalRaw, {
      duration_days: durationDays,
      interest_percent: apr,
    })
    if (figures) {
      interest = figures.interest
      calculatedTotal = figures.repayment
    }
  }

  let totalOwed = owedFromApi ?? calculatedTotal
  if (totalOwed == null && principalRaw != null && interest != null) {
    totalOwed = principalRaw + interest
  }
  if (interest == null && totalOwed != null && principalRaw != null && totalOwed >= principalRaw) {
    interest = totalOwed - principalRaw
  }

  return { principal: principalRaw, interest, totalOwed }
}

/** Build review-row values from `GET /api/loan/details/<id>/`. */
export function mapLoanDetailsToRepayReviewBreakdown(api: LoanDetailsResponse): MerchantRepayReviewBreakdown {
  const { principal, interest, totalOwed } = resolvePrincipalAndInterest(api)
  const isDefaulted = api.lifecycle.status?.trim().toLowerCase() === 'defaulted'

  const principalRaw = api.summary.funding?.trim() ? api.summary.funding : api.summary.totalAmount

  return {
    subtitle: buildSubtitle(api),
    principalDue: formatMoneyLabel(principalRaw, principal),
    interestDue: formatMoneyLabel(null, interest),
    lateFeesDue: isDefaulted ? '—' : formatLoanCurrency(0),
    platformFee: null,
    totalOwed: formatMoneyLabel(api.summary.amountOwed ?? api.summary.funding, totalOwed),
    lendingPoolName: INVESTMENT_POOL.name,
    aprLabel: formatAprLabel(api.summary.apr),
  }
}

/** Demo/mock receivable breakdown for local config rows. */
export function demoRepayReviewBreakdown(detail: ReceivableDetailView): MerchantRepayReviewBreakdown {
  const principal = parseMoneyToHuman(detail.row.loanAmount)
  const total = parseMoneyToHuman(detail.row.repaymentAmount)
  const interest =
    principal != null && total != null && total >= principal ? total - principal : null

  return {
    subtitle: detail.subtitle,
    principalDue: detail.row.loanAmount,
    interestDue: interest != null ? formatLoanCurrency(interest) : '—',
    lateFeesDue: formatLoanCurrency(0),
    platformFee: null,
    totalOwed: detail.row.repaymentAmount,
    lendingPoolName: INVESTMENT_POOL.name,
    aprLabel: detail.row.apr,
  }
}

export function emptyRepayReviewBreakdown(): MerchantRepayReviewBreakdown {
  return { ...EMPTY_BREAKDOWN }
}

/** Share of total owed represented by this payment (capped at 100%). */
export function formatRepayPercentagePaid(
  paymentAmount: number,
  totalOwedHuman: number | null | undefined,
): string {
  if (paymentAmount <= 0 || totalOwedHuman == null || totalOwedHuman <= 0) return '—'
  const pct = Math.min(100, Math.round((paymentAmount / totalOwedHuman) * 100))
  return `${pct}%`
}
