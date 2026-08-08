import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import { DEFAULT_APP_CHAIN } from '@/wallet/appChain'

const RISK_TIERS_PATH = '/api/loan/risk-tiers/'

/** Single tier from `GET /api/loan/risk-tiers/` (on-chain AllocationController). */
export type RiskTier = {
  id: number
  duration_days: number
  /**
   * Flat interest for the full loan tenor in percent points
   * (on-chain tenorRateBps / 100; e.g. 1000 bps → 10.0% of principal).
   */
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
 * `GET /api/loan/risk-tiers/` — list tiers with duration, flat tenor interest %, and active flag.
 *
 * The endpoint is chain-scoped via `chainId`. It is public (no auth session to infer the chain
 * from), so `chainId` must be sent explicitly or the backend falls back to its default network.
 * Defaults to the app's target chain (`DEFAULT_APP_CHAIN`, resolved from `VITE_CONTRACT_NETWORK`).
 */
export async function fetchRiskTiers(chainId?: number | null): Promise<RiskTier[]> {
  const base = requireApiBaseUrl()
  const url = new URL(`${base}${RISK_TIERS_PATH}`)
  const resolvedChainId =
    typeof chainId === 'number' && Number.isFinite(chainId) && chainId > 0
      ? Math.trunc(chainId)
      : DEFAULT_APP_CHAIN.id
  url.searchParams.set('chainId', String(resolvedChainId))
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  const data = await parseJsonResponse<RiskTiersResponse>(res)
  const rows = Array.isArray(data.risk_tiers) ? data.risk_tiers : []
  return rows.map(normalizeRiskTier).filter((t): t is RiskTier => t != null)
}
