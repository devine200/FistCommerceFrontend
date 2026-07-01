import { apiUrl } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import type { ServicerWalletSnapshot } from '@/api/adminActionResponse'

const SERVICER_WALLET_PATH = '/metrics/admin/ops/servicer-wallet/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for servicer wallet request.')
  const header = /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
  return {
    Accept: 'application/json',
    Authorization: header,
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function pickStr(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

export type AdminServicerWallet = ServicerWalletSnapshot & {
  lowBalanceWarning: boolean
  lowBalanceThresholdWei: string
}

function normalizeServicerWallet(raw: unknown): AdminServicerWallet {
  const r = asRecord(raw)
  return {
    address: pickStr(r, 'address'),
    nativeBalanceWei: pickStr(r, 'nativeBalanceWei', 'native_balance_wei'),
    lowBalanceWarning: pickBool(r, 'lowBalanceWarning', 'low_balance_warning'),
    lowBalanceThresholdWei: pickStr(r, 'lowBalanceThresholdWei', 'low_balance_threshold_wei'),
  }
}

/** `GET /api/metrics/admin/ops/servicer-wallet/` */
export async function fetchAdminServicerWallet(
  accessToken: string | null | undefined,
): Promise<AdminServicerWallet> {
  const res = await fetchWithAuthRecovery(apiUrl(SERVICER_WALLET_PATH), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await res.json()
  return normalizeServicerWallet(raw)
}

/** Format wei string to ETH with up to 6 decimal places. */
export function formatWeiToEth(wei: string): string {
  const t = wei.trim()
  if (!t || !/^\d+$/.test(t)) return '—'
  try {
    const whole = BigInt(t)
    const eth = Number(whole) / 1e18
    if (!Number.isFinite(eth)) return '—'
    return eth.toLocaleString('en-US', { maximumFractionDigits: 6 })
  } catch {
    return '—'
  }
}
