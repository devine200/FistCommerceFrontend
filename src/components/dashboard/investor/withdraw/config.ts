import type {
  WithdrawalCompletedMetric,
  WithdrawalReviewRow,
  WithdrawalSource,
  WithdrawalSourceCard,
} from '@/components/dashboard/investor/withdraw/types'

export const WITHDRAW_QUICK_AMOUNTS = [500, 1000, 2500, 5000] as const
export const WITHDRAW_DEFAULT_AMOUNT = 10000

export const WITHDRAW_SOURCES: WithdrawalSourceCard[] = [
  { key: 'principal', label: 'Principal', value: '$20,000' },
  { key: 'earnings', label: 'Earnings', value: '$4,000' },
]

export const WITHDRAWAL_POOL_NAME = 'Titan Growth Fund'
export const WITHDRAWAL_METHOD = 'Standard Withdrawal'
export const WITHDRAWAL_PROCESSING_TIME = '24-48 hrs'
export const WITHDRAWAL_WARNING =
  "Standard withdrawals are processed within 24-48 hours. You'll receive a confirmation once the transaction is complete."

export function withdrawalSourceLabel(source: WithdrawalSource): string {
  return source === 'principal' ? 'Principal' : 'Earnings'
}

export function buildWithdrawalReviewRows(
  source: WithdrawalSource,
  amount: number,
  destinationWallet: string,
): WithdrawalReviewRow[] {
  const amountText = `$${amount.toLocaleString()}`

  return [
    { label: 'Source', value: withdrawalSourceLabel(source) },
    { label: 'Method', value: WITHDRAWAL_METHOD },
    { label: 'Processing Time', value: WITHDRAWAL_PROCESSING_TIME },
    { label: 'Withdrawal Amount', value: amountText },
    { label: 'Fee', value: 'None' },
    { label: 'Net Amount', value: amountText, valueTone: 'primary' },
    { label: 'Destination', value: destinationWallet },
    { label: 'Network', value: 'Arbitrum One' },
  ]
}

export function buildWithdrawalCompletedMetrics(amount: number): WithdrawalCompletedMetric[] {
  const amountText = `$${amount.toLocaleString()}`

  return [
    { label: 'Amount', value: amountText },
    { label: 'Net Received', value: amountText },
    { label: 'Method', value: 'Standard' },
    { label: 'Status', value: 'Processing' },
  ]
}
