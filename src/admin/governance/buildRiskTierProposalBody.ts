export type RiskTierProposalInput = {
  tierId: number
  interestPercent: number
  maxTenorDays: number
  active: boolean
  maxMerchantPercent?: number
}

/** Maps UI tier fields to multisig risk-tier create body (snake_case for API). */
export function buildRiskTierProposalBody(input: RiskTierProposalInput): Record<string, unknown> {
  const tenorRateBps = Math.round(input.interestPercent * 100)
  const body: Record<string, unknown> = {
    tier_id: input.tierId,
    tenor_rate_bps: tenorRateBps,
    max_tenor_days: input.maxTenorDays,
    active: input.active,
    // Legacy aliases some backends may still accept
    interest_percent: input.interestPercent,
    duration_days: input.maxTenorDays,
  }
  if (input.maxMerchantPercent != null && Number.isFinite(input.maxMerchantPercent)) {
    body.max_merchant_percent = input.maxMerchantPercent
  }
  return body
}
