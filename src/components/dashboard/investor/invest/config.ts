import {
  displayDashboardMetricString,
  displayDashboardPercentString,
  displayPoolApyPercent,
  type InvestorMetrics,
  type PoolMetrics,
} from '@/api/metrics'
import type {
  InvestmentCompletedMetric,
  InvestmentPoolInfo,
  InvestmentReviewRow,
} from '@/components/dashboard/investor/invest/types'

export const INVEST_QUICK_AMOUNTS = [500, 1000, 2500, 5000] as const

/** Fallback pool card when metrics have not loaded yet. */
export const INVESTMENT_POOL: InvestmentPoolInfo = {
  name: 'Fist Commerce',
  tvl: '$800K',
  apy: '12.8%',
  recommended: true,
}

export const INVESTMENT_TERMS_LABEL = 'Pool Details & Terms'
export const INVESTMENT_WARNING =
  'Funds will be locked for the loan duration (30-60 days). Early withdrawal may incur penalties. Smart contract interactions are irreversible.'

const FALLBACK_APY_RATE = 0.064

export function formatInvestAmountUsd(amount: number): string {
  return displayDashboardMetricString(amount)
}

export function buildLiveInvestmentPoolInfo(poolTitle: string, poolMetrics: PoolMetrics | null): InvestmentPoolInfo {
  const name = poolTitle?.trim() || INVESTMENT_POOL.name
  if (!poolMetrics) {
    return { ...INVESTMENT_POOL, name }
  }
  return {
    name,
    tvl: displayDashboardMetricString(poolMetrics.tvl),
    apy: displayPoolApyPercent(poolMetrics.apy),
    recommended: INVESTMENT_POOL.recommended,
  }
}

export function buildInvestmentCompletedMetrics(
  displayAmount: number,
  poolMetrics: PoolMetrics | null,
  investorMetrics: InvestorMetrics | null,
): InvestmentCompletedMetric[] {
  const apyLabel = poolMetrics ? displayPoolApyPercent(poolMetrics.apy) : INVESTMENT_POOL.apy
  const shareLabel = investorMetrics?.share_of_pool
    ? displayDashboardPercentString(investorMetrics.share_of_pool)
    : '—'

  return [
    { label: 'Amount', value: formatInvestAmountUsd(displayAmount) },
    { label: 'Expected APY', value: apyLabel },
    { label: 'Pool Share', value: shareLabel },
  ]
}

export function buildInvestmentReviewRows(
  displayAmount: number,
  poolName: string,
  poolMetrics: PoolMetrics | null,
  investorMetrics: InvestorMetrics | null,
): InvestmentReviewRow[] {
  const apyRate = poolMetrics && Number.isFinite(poolMetrics.apy) ? poolMetrics.apy / 100 : FALLBACK_APY_RATE
  const apyLabel = poolMetrics ? displayPoolApyPercent(poolMetrics.apy) : INVESTMENT_POOL.apy
  const estimatedAnnualReturn = displayAmount * apyRate
  const poolShareLabel = investorMetrics?.share_of_pool
    ? displayDashboardPercentString(investorMetrics.share_of_pool)
    : '—'

  return [
    { label: 'Token', value: 'USDC' },
    { label: 'Network', value: 'Arbitrum One' },
    { label: 'Pool', value: poolName?.trim() || 'Lending pool' },
    { label: 'APY', value: apyLabel },
    {
      label: 'Est. Annual Return',
      value: formatInvestAmountUsd(estimatedAnnualReturn),
      valueTone: 'positive',
    },
    { label: 'Pool Share', value: poolShareLabel },
    { label: 'Gas Fee (est.)', value: '$2.34' },
  ]
}
