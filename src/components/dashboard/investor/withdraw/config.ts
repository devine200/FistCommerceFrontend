import {
  displayDashboardMetricString,
  displayDashboardPercentString,
  displayPoolApyPercent,
  type InvestorMetrics,
  type PoolMetrics,
} from '@/api/metrics'
import { formatInvestAmountUsd } from '@/components/dashboard/investor/invest/config'
import type { WithdrawalCompletedMetric, WithdrawalReviewRow } from '@/components/dashboard/investor/withdraw/types'

export const WITHDRAW_QUICK_AMOUNTS = [500, 1000, 2500, 5000] as const

export const WITHDRAWAL_METHOD = 'Standard Withdrawal'
export const WITHDRAWAL_PROCESSING_TIME = '24-48 hrs'
export const WITHDRAWAL_WARNING =
  "Standard withdrawals are processed within 24-48 hours. You'll receive a confirmation once the transaction is complete."

/** Total on-chain pool position — shown as “Investment balance”. */
export function getInvestmentBalanceDisplay(investmentBalanceDisplay: string): string {
  const trimmed = investmentBalanceDisplay.trim()
  return trimmed && trimmed !== '—' ? trimmed : '—'
}

export function buildWithdrawalReviewRows(
  amount: number,
  destinationWallet: string,
  poolName: string,
  poolMetrics: PoolMetrics | null,
  investorMetrics: InvestorMetrics | null,
  investmentBalanceDisplay: string,
  options?: { gasFeeEstimateDisplay?: string },
): WithdrawalReviewRow[] {
  const amountText = formatInvestAmountUsd(amount)
  const rows: WithdrawalReviewRow[] = []

  rows.push({ label: 'Pool', value: poolName?.trim() || '—' })

  if (poolMetrics) {
    rows.push({ label: 'Pool TVL', value: displayDashboardMetricString(poolMetrics.tvl) })
    rows.push({ label: 'Pool APY', value: displayPoolApyPercent(poolMetrics.apy) })
  }

  rows.push({ label: 'Investment balance', value: getInvestmentBalanceDisplay(investmentBalanceDisplay) })

  const shareOfPoolRaw = investorMetrics?.share_of_pool
  if (shareOfPoolRaw != null && String(shareOfPoolRaw).trim() !== '') {
    rows.push({
      label: 'Your pool share',
      value: displayDashboardPercentString(String(shareOfPoolRaw)),
    })
  }

  rows.push(
    { label: 'Method', value: WITHDRAWAL_METHOD },
    { label: 'Processing Time', value: WITHDRAWAL_PROCESSING_TIME },
    { label: 'Withdrawal Amount', value: amountText },
    { label: 'Fee', value: 'None' },
    { label: 'Net Amount', value: amountText, valueTone: 'primary' },
    { label: 'Destination', value: destinationWallet },
    { label: 'Gas Fee (est.)', value: options?.gasFeeEstimateDisplay ?? '—' },
    { label: 'Network', value: 'Arbitrum One' },
  )

  return rows
}

export function buildWithdrawalCompletedMetrics(amount: number): WithdrawalCompletedMetric[] {
  const amountText = formatInvestAmountUsd(amount)

  return [
    { label: 'Amount', value: amountText },
    { label: 'Net Received', value: amountText },
    { label: 'Method', value: 'Standard' },
    { label: 'Status', value: 'Processing' },
  ]
}
