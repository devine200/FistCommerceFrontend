import { displayDashboardMetricString } from '@/api/metrics'
import { formatLoanCurrency } from '@/utils/loanTierCalculations'

export type LoanRepaymentAmountInputs = {
  /** On-chain funded principal when available. */
  funding?: string | null
  /** Requested / booked loan amount fallback. */
  totalAmount?: string | null
  /** Remaining balance after partial repayments. */
  amountOwed?: string | null
}

export type LoanRepaymentAmountLabels = {
  amountRepaid: string
  amountLeft: string
}

/** Parse money strings including zero (unlike `parseMoneyToHuman`, which rejects ≤ 0). */
export function parseMoneyAmount(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

function formatMoneyAmount(amount: number | null, rawFallback?: string | null): string {
  if (amount != null && Number.isFinite(amount)) return formatLoanCurrency(amount)
  if (!rawFallback?.trim()) return '—'
  const formatted = displayDashboardMetricString(rawFallback)
  return formatted === '—' ? rawFallback.trim() : formatted
}

/**
 * Remaining due is `amountOwed`.
 * Repaid is deduced as `max(0, amountBorrowed - amountOwed)` where borrowed is
 * `funding` (preferred) or `totalAmount`.
 */
export function resolveLoanRepaymentAmountLabels(
  input: LoanRepaymentAmountInputs,
): LoanRepaymentAmountLabels {
  const borrowed =
    parseMoneyAmount(input.funding) ?? parseMoneyAmount(input.totalAmount)
  const amountLeft = parseMoneyAmount(input.amountOwed)
  const amountRepaid =
    borrowed != null && amountLeft != null ? Math.max(0, borrowed - amountLeft) : null

  return {
    amountRepaid: formatMoneyAmount(amountRepaid),
    amountLeft: formatMoneyAmount(amountLeft, input.amountOwed),
  }
}
