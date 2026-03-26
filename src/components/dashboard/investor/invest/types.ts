export enum InvestmentStep {
  AmountEntry = 'amount-entry',
  PoolSelection = 'pool-selection',
  InvestmentConfirmation = 'investment-confirmation',
  InvestmentCompleted = 'investment-completed',
}

export type InvestmentPoolInfo = {
  name: string
  tvl: string
  apy: string
  recommended?: boolean
}

export type InvestmentReviewRow = {
  label: string
  value: string
  valueTone?: 'default' | 'positive'
}

export type InvestmentCompletedMetric = {
  label: string
  value: string
}
