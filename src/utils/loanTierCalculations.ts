import type { RiskTier } from '@/api/riskTiers'

export type LoanTierFigures = {
  interest: number
  repayment: number
}

/**
 * Pro-rated simple interest: principal × (annual % / 100) × (duration_days / 365).
 * `interest_percent` is annual (tenorRateBps / 100 on-chain).
 */
export function calculateLoanTierFigures(
  principal: number,
  tier: Pick<RiskTier, 'duration_days' | 'interest_percent'>,
): LoanTierFigures | null {
  if (!Number.isFinite(principal) || principal <= 0) return null
  if (!Number.isFinite(tier.duration_days) || tier.duration_days <= 0) return null
  if (!Number.isFinite(tier.interest_percent) || tier.interest_percent < 0) return null

  const interest = principal * (tier.interest_percent / 100) * (tier.duration_days / 365)
  return {
    interest,
    repayment: principal + interest,
  }
}

export function formatLoanCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return ''
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function riskTierSelectLabel(tier: RiskTier): string {
  const rate = Number.isFinite(tier.interest_percent)
    ? tier.interest_percent.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : '—'
  const suffix = tier.active ? '' : ' (unavailable)'
  return `${tier.duration_days} days — ${rate}% APR${suffix}`
}
