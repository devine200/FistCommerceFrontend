import { parseAdminWriteResponse } from '@/api/adminActionResponse'
import { apiUrl, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { isAddress } from 'viem'

export type ProtocolSettingsState = {
  fundingPool: {
    minDeposit: string
    payoutRouter: string
    allocator: string
    acceptedToken: string
  }
  payoutRouter: {
    fundingPool: string
    allocator: string
    acceptedToken: string
  }
  riskAllocator: {
    maxMerchantBps: number
  }
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for protocol settings API request.')
  const header = /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
  return {
    Accept: 'application/json',
    Authorization: header,
  }
}

function jsonAuthHeaders(accessToken: string | null | undefined): HeadersInit {
  return {
    ...authHeaders(accessToken),
    'Content-Type': 'application/json',
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

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

function normalizeProtocolSettingsState(raw: unknown): ProtocolSettingsState {
  const r = asRecord(raw)
  const fundingPool = asRecord(r.fundingPool ?? r.funding_pool)
  const payoutRouter = asRecord(r.payoutRouter ?? r.payout_router)
  const riskAllocator = asRecord(r.riskAllocator ?? r.risk_allocator)

  return {
    fundingPool: {
      minDeposit: pickStr(fundingPool, 'minDeposit', 'min_deposit'),
      payoutRouter: pickStr(fundingPool, 'payoutRouter', 'payout_router'),
      allocator: pickStr(fundingPool, 'allocator'),
      acceptedToken: pickStr(fundingPool, 'acceptedToken', 'accepted_token'),
    },
    payoutRouter: {
      fundingPool: pickStr(payoutRouter, 'fundingPool', 'funding_pool'),
      allocator: pickStr(payoutRouter, 'allocator'),
      acceptedToken: pickStr(payoutRouter, 'acceptedToken', 'accepted_token'),
    },
    riskAllocator: {
      maxMerchantBps: pickNumber(riskAllocator, 'maxMerchantBps', 'max_merchant_bps'),
    },
  }
}

/** `GET /api/multisig/protocol-settings/` — on-chain protocol settings for admin panels. */
export async function fetchProtocolSettingsState(
  accessToken: string | null | undefined,
): Promise<ProtocolSettingsState> {
  const res = await fetchWithAuthRecovery(apiUrl('/multisig/protocol-settings/'), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeProtocolSettingsState(raw)
}

function postProposal(
  accessToken: string | null | undefined,
  path: string,
  body: Record<string, unknown>,
  options?: { signal?: AbortSignal },
) {
  return fetchWithAuthRecovery(apiUrl(path), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify(body),
    signal: options?.signal,
  }).then((res) => parseAdminWriteResponse(res))
}

/** `POST /api/multisig/proposals/max-merchant-bps/` */
export function postMultisigCreateMaxMerchantBpsProposal(
  accessToken: string | null | undefined,
  maxMerchantBps: number,
  options?: { signal?: AbortSignal },
) {
  return postProposal(
    accessToken,
    '/multisig/proposals/max-merchant-bps/',
    { max_merchant_bps: maxMerchantBps },
    options,
  )
}

/** `POST /api/multisig/proposals/funding-pool-min-deposit/` */
export function postMultisigCreateFundingPoolMinDepositProposal(
  accessToken: string | null | undefined,
  minDeposit: string,
  options?: { signal?: AbortSignal },
) {
  return postProposal(
    accessToken,
    '/multisig/proposals/funding-pool-min-deposit/',
    { min_deposit: minDeposit },
    options,
  )
}

/** `POST /api/multisig/proposals/funding-pool-payout-router/` */
export function postMultisigCreateFundingPoolPayoutRouterProposal(
  accessToken: string | null | undefined,
  payoutRouter: string,
  options?: { signal?: AbortSignal },
) {
  return postProposal(
    accessToken,
    '/multisig/proposals/funding-pool-payout-router/',
    { payout_router: payoutRouter.trim() },
    options,
  )
}

/** `POST /api/multisig/proposals/payout-router-funding-pool/` */
export function postMultisigCreatePayoutRouterFundingPoolProposal(
  accessToken: string | null | undefined,
  fundingPool: string,
  options?: { signal?: AbortSignal },
) {
  return postProposal(
    accessToken,
    '/multisig/proposals/payout-router-funding-pool/',
    { funding_pool: fundingPool.trim() },
    options,
  )
}

/** `POST /api/multisig/proposals/payout-router-allocator/` */
export function postMultisigCreatePayoutRouterAllocatorProposal(
  accessToken: string | null | undefined,
  allocator: string,
  options?: { signal?: AbortSignal },
) {
  return postProposal(
    accessToken,
    '/multisig/proposals/payout-router-allocator/',
    { allocator: allocator.trim() },
    options,
  )
}

/** `POST /api/multisig/proposals/payout-router-accepted-token/` */
export function postMultisigCreatePayoutRouterAcceptedTokenProposal(
  accessToken: string | null | undefined,
  acceptedToken: string,
  options?: { signal?: AbortSignal },
) {
  return postProposal(
    accessToken,
    '/multisig/proposals/payout-router-accepted-token/',
    { accepted_token: acceptedToken.trim() },
    options,
  )
}

export function percentToBps(percent: string): number {
  const n = Number(percent)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

export function bpsToPercent(bps: number): string {
  if (!Number.isFinite(bps)) return '0'
  const pct = bps / 100
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(2).replace(/\.?0+$/, '')
}

export function addressesEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function isValidEthAddress(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length > 0 && isAddress(trimmed, { strict: false })
}

export function normalizeTokenAmount(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return trimmed
  return String(n)
}

export function tokenAmountsEqual(a: string, b: string): boolean {
  const na = normalizeTokenAmount(a)
  const nb = normalizeTokenAmount(b)
  if (!na || !nb) return na === nb
  const aNum = Number(na)
  const bNum = Number(nb)
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum === bNum
  return na === nb
}

export function assertValidEthAddress(value: string, label: string): void {
  if (!isValidEthAddress(value)) {
    throw new Error(`${label} must be a valid Ethereum address.`)
  }
}

export function assertValidTokenAmount(value: string, label: string): void {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${label} is required.`)
  }
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${label} must be a non-negative number.`)
  }
}
