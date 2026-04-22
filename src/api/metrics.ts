import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'

/** `GET /api/metrics/investor/` — monetary fields are pre-formatted strings from the API. */
export type InvestorMetrics = {
  total_deposited: string
  total_withdrawn: string
  current_position_value: string
  total_interest_earned: string
  share_of_pool: string
  netDeposited: string
  /** Percent points as returned by the API (e.g. `5.25` → 5.25%). */
  roi: number
}

/** `GET /api/metrics/pool/` — dollar-like amounts are strings; ratios are numbers. */
export type PoolMetrics = {
  tvl: string
  liquidAssets: string
  outstanding: string
  availableLiquidity: string
  /** Utilization ratio in (0, 1] as a fraction (e.g. `0.65` → 65%), or percent points when greater than 1. */
  utilization: number
  /** APY in percent points (e.g. `5.25` → 5.25%). */
  apy: number
  minDeposit: number
}

/** API string fields: show exactly what the server sent (trimmed); empty → em dash. */
export function displayMetricsStringField(value: string): string {
  const t = typeof value === 'string' ? value.trim() : ''
  return t.length ? t : '—'
}

/** Fixed two fractional digits, no thousands separators (rates / percentages). */
function formatMetricNumberTwoDecimalsNoGrouping(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
}

/** Fixed two fractional digits with grouping (amounts). */
function formatMetricNumberTwoDecimalsGrouped(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })
}

function parseMoneyLikeInput(value: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const t = value.trim()
  if (!t) return null
  const significant = t.replace(/[^0-9.,-]/g, '')
  if (!significant || !/\d/.test(significant)) return null
  const normalized = significant.replace(/,/g, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

/**
 * Formats a numeric amount as USD: `$`, thousands separators, two decimal places.
 * Accepts a number or a string from the API (commas, `$`, trailing `USDC`, etc. are stripped for parsing).
 * If the value cannot be parsed as a number but the string is non-empty, the trimmed string is returned.
 */
export function displayDashboardMetricString(value: string | number): string {
  const n = parseMoneyLikeInput(value)
  if (n === null) {
    const t = typeof value === 'string' ? value.trim() : ''
    return t.length ? t : '—'
  }
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Percent from an API string: same numeric parsing as money fields, then `X.XX%`. */
export function displayDashboardPercentString(value: string): string {
  const n = parseMoneyLikeInput(value)
  if (n === null) {
    const t = value.trim()
    return t.length ? t : '—'
  }
  return `${formatMetricNumberTwoDecimalsNoGrouping(n)}%`
}

/** APY: numeric percent points from API — no scaling. */
export function displayPoolApyPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${formatMetricNumberTwoDecimalsNoGrouping(value)}%`
}

/** ROI: numeric percent points from API — no scaling. */
export function displayInvestorRoiPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${formatMetricNumberTwoDecimalsNoGrouping(value)}%`
}

/**
 * Utilization: values in (0, 1] are treated as fractions (e.g. `0.65` → 65%).
 * Values greater than 1 are treated as already percent points (e.g. `65` → 65%).
 */
export function displayPoolUtilization(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const pct = value > 0 && value <= 1 ? value * 100 : value
  return `${formatMetricNumberTwoDecimalsNoGrouping(pct)}%`
}

/** `minDeposit` as a plain formatted number (no currency symbol — API may encode units elsewhere). */
export function displayPoolMinDeposit(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return formatMetricNumberTwoDecimalsGrouped(value)
}

/**
 * Dashboard pool cards / merchant views: compact dollar display with two decimal places on the scale
 * (e.g. `$1.50M`, `$538,500.00`).
 */
export function formatDashboardCompactUsd(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const n = value
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Plain amount with grouping and two decimals (no `$`), for summary lines that append units separately. */
export function formatDashboardPlainAmount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Values in `(0, 1]` are fractions (e.g. `0.65` → 65.00%); values greater than `1` are percent points (e.g. `65` → 65.00%).
 */
export function formatDashboardPercentMetric(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const pct = value > 1 ? value : value * 100
  return `${pct.toFixed(2)}%`
}

function apiBaseUrl(): string {
  // `VITE_API_BASE_URL` is expected to include `/api` (see `.env.example`).
  return requireApiBaseUrl()
}

function requireAccessToken(accessToken: string | null | undefined): string {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for authorized metrics request.')
  return t
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const token = requireAccessToken(accessToken)
  return {
    Accept: 'application/json',
    Authorization: `Token ${token}`,
  }
}

function asJsonObject(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
}

/** Prefer first key present with a non-empty string or finite number (DRF snake_case vs camelCase). */
function pickStringField(r: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k]
    if (typeof v === 'string') {
      const t = v.trim()
      if (t.length) return t
    }
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  return ''
}

function pickNumberField(r: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = r[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v.replace(/,/g, ''))
      if (Number.isFinite(n)) return n
    }
  }
  return NaN
}

/**
 * Coerce `GET /api/metrics/investor/` JSON into `InvestorMetrics`.
 * Django often returns `net_deposited` while the UI historically used `netDeposited`.
 */
function normalizeInvestorMetricsPayload(raw: unknown): InvestorMetrics {
  const r = asJsonObject(raw)
  return {
    total_deposited: pickStringField(r, 'total_deposited', 'totalDeposited'),
    total_withdrawn: pickStringField(r, 'total_withdrawn', 'totalWithdrawn'),
    current_position_value: pickStringField(r, 'current_position_value', 'currentPositionValue'),
    total_interest_earned: pickStringField(r, 'total_interest_earned', 'totalInterestEarned'),
    share_of_pool: pickStringField(r, 'share_of_pool', 'shareOfPool'),
    netDeposited: pickStringField(r, 'netDeposited', 'net_deposited'),
    roi: pickNumberField(r, 'roi'),
  }
}

/** Coerce `GET /api/metrics/pool/` JSON into `PoolMetrics` (snake_case aliases). */
function normalizePoolMetricsPayload(raw: unknown): PoolMetrics {
  const r = asJsonObject(raw)
  return {
    tvl: pickStringField(r, 'tvl'),
    liquidAssets: pickStringField(r, 'liquidAssets', 'liquid_assets'),
    outstanding: pickStringField(r, 'outstanding'),
    availableLiquidity: pickStringField(r, 'availableLiquidity', 'available_liquidity'),
    utilization: pickNumberField(r, 'utilization'),
    apy: pickNumberField(r, 'apy'),
    minDeposit: pickNumberField(r, 'minDeposit', 'min_deposit'),
  }
}

export async function fetchPoolMetrics(accessToken: string | null | undefined): Promise<PoolMetrics> {
  const base = apiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}/api/metrics/pool/`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizePoolMetricsPayload(raw)
}

export async function fetchInvestorMetrics(accessToken: string | null | undefined): Promise<InvestorMetrics> {
  const base = apiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}/api/metrics/investor/`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeInvestorMetricsPayload(raw)
}

/** `GET /api/metrics/investor/transactions` */
export type InvestorTransactionApi = {
  transaction_type: string
  /** Human-readable token amount (from wei). */
  amount: string
  timestamp: string
  transaction_hash: string
}

export type InvestorTransactionsResponse = {
  transactions: InvestorTransactionApi[]
}

export const convertTimestampToDate = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function fetchInvestorTransactions(
  accessToken: string | null | undefined,
): Promise<InvestorTransactionApi[]> {
  const base = apiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}/api/metrics/investor/transactions`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const data = await parseJsonResponse<InvestorTransactionsResponse>(res)
  return data.transactions ? data.transactions : []
}
