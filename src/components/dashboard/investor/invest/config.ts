import type {
  InvestmentCompletedMetric,
  InvestmentPoolInfo,
  InvestmentReviewRow,
} from '@/components/dashboard/investor/invest/types'

export const INVEST_QUICK_AMOUNTS = [500, 1000, 2500, 5000] as const
export const INVEST_DEFAULT_AMOUNT = 10000

export const INVESTMENT_POOL: InvestmentPoolInfo = {
  name: 'Fist Commerce',
  tvl: '$800K',
  apy: '12.8%',
  recommended: true,
}

export const INVESTMENT_TERMS_LABEL = 'Pool Details & Terms'
export const INVESTMENT_WARNING =
  'Funds will be locked for the loan duration (30-60 days). Early withdrawal may incur penalties. Smart contract interactions are irreversible.'

export const ESTIMATED_ANNUAL_RETURN_RATE = 0.064
export const EXPECTED_APY = '12.8%'
export const POOL_SHARE = '0.6250%'

export function buildInvestmentCompletedMetrics(displayAmount: number): InvestmentCompletedMetric[] {
  return [
    { label: 'Amount', value: `$${displayAmount.toLocaleString()}` },
    { label: 'Expected APY', value: EXPECTED_APY },
    { label: 'Pool Share', value: POOL_SHARE },
  ]
}

export function buildInvestmentReviewRows(displayAmount: number): InvestmentReviewRow[] {
  const estimatedAnnualReturn = displayAmount * ESTIMATED_ANNUAL_RETURN_RATE

  return [
    { label: 'Token', value: 'USDT (Tether)' },
    { label: 'Network', value: 'Arbitrum One' },
    { label: 'Pool', value: 'Fist Commerce Pool' },
    { label: 'APY', value: INVESTMENT_POOL.apy },
    { label: 'Est. Annual Return', value: `$${estimatedAnnualReturn.toFixed(2)}`, valueTone: 'positive' },
    { label: 'Pool Share', value: '0.6250%' },
    { label: 'Gas Fee (est.)', value: '$2.34' },
  ]
}
