import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'

const RISK_TIERS_PATH = '/api/loan/risk-tiers/'

/** Single tier from `GET /api/loan/risk-tiers/` (on-chain AllocationController). */
export type RiskTier = {
  id: number
  duration_days: number
  /** Annual interest rate in percent points (e.g. 10.0 → 10% APR). */
  interest_percent: number
  active: boolean
}

export type RiskTiersResponse = {
  risk_tiers: RiskTier[]
}

function normalizeRiskTier(raw: unknown): RiskTier | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = typeof r.id === 'number' ? r.id : Number(r.id)
  const duration_days =
    typeof r.duration_days === 'number' ? r.duration_days : Number(r.duration_days)
  const interest_percent =
    typeof r.interest_percent === 'number' ? r.interest_percent : Number(r.interest_percent)
  const active = r.active === true
  if (!Number.isInteger(id) || id <= 0) return null
  if (!Number.isInteger(duration_days) || duration_days <= 0) return null
  if (!Number.isFinite(interest_percent) || interest_percent < 0) return null
  return { id, duration_days, interest_percent, active }
}

/**
 * `GET /api/loan/risk-tiers/` — list tiers with duration, annual interest %, and active flag.
 */
export async function fetchRiskTiers(): Promise<RiskTier[]> {
  const base = requireApiBaseUrl()
  const res = await fetch(`${base}${RISK_TIERS_PATH}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  const data = await parseJsonResponse<RiskTiersResponse>(res)
  const rows = Array.isArray(data.risk_tiers) ? data.risk_tiers : []
  return rows.map(normalizeRiskTier).filter((t): t is RiskTier => t != null)
}
