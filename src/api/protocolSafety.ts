import { parseAdminWriteResponse } from '@/api/adminActionResponse'
import { apiUrl, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

export type ProtocolSafetyState = {
  paused: boolean
  depositsPaused: boolean
  withdrawalsPaused: boolean
  fundingPaused: boolean
  repaymentsPaused: boolean
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for protocol safety API request.')
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

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

function normalizeProtocolSafetyState(raw: unknown): ProtocolSafetyState {
  const r = asRecord(raw)
  return {
    paused: pickBool(r, 'paused'),
    depositsPaused: pickBool(r, 'depositsPaused', 'deposits_paused'),
    withdrawalsPaused: pickBool(r, 'withdrawalsPaused', 'withdrawals_paused'),
    fundingPaused: pickBool(r, 'fundingPaused', 'funding_paused'),
    repaymentsPaused: pickBool(r, 'repaymentsPaused', 'repayments_paused'),
  }
}

/** `GET /api/multisig/protocol-safety/` — on-chain ProtocolController pause flags. */
export async function fetchProtocolSafetyState(
  accessToken: string | null | undefined,
): Promise<ProtocolSafetyState> {
  const res = await fetchWithAuthRecovery(apiUrl('/multisig/protocol-safety/'), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeProtocolSafetyState(raw)
}

function postPauseProposal(
  accessToken: string | null | undefined,
  path: string,
  paused: boolean,
  options?: { signal?: AbortSignal },
) {
  return fetchWithAuthRecovery(apiUrl(path), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({ paused }),
    signal: options?.signal,
  }).then((res) => parseAdminWriteResponse(res))
}

/** `POST /api/multisig/proposals/protocol-pause/` — create global pause governance proposal. */
export function postMultisigCreateProtocolPauseProposal(
  accessToken: string | null | undefined,
  paused: boolean,
  options?: { signal?: AbortSignal },
) {
  return postPauseProposal(accessToken, '/multisig/proposals/protocol-pause/', paused, options)
}

/** `POST /api/multisig/proposals/protocol-deposits-pause/` */
export function postMultisigCreateProtocolDepositsPauseProposal(
  accessToken: string | null | undefined,
  paused: boolean,
  options?: { signal?: AbortSignal },
) {
  return postPauseProposal(accessToken, '/multisig/proposals/protocol-deposits-pause/', paused, options)
}

/** `POST /api/multisig/proposals/protocol-withdrawals-pause/` */
export function postMultisigCreateProtocolWithdrawalsPauseProposal(
  accessToken: string | null | undefined,
  paused: boolean,
  options?: { signal?: AbortSignal },
) {
  return postPauseProposal(accessToken, '/multisig/proposals/protocol-withdrawals-pause/', paused, options)
}

/** `POST /api/multisig/proposals/protocol-funding-pause/` */
export function postMultisigCreateProtocolFundingPauseProposal(
  accessToken: string | null | undefined,
  paused: boolean,
  options?: { signal?: AbortSignal },
) {
  return postPauseProposal(accessToken, '/multisig/proposals/protocol-funding-pause/', paused, options)
}

/** `POST /api/multisig/proposals/protocol-repayments-pause/` */
export function postMultisigCreateProtocolRepaymentsPauseProposal(
  accessToken: string | null | undefined,
  paused: boolean,
  options?: { signal?: AbortSignal },
) {
  return postPauseProposal(accessToken, '/multisig/proposals/protocol-repayments-pause/', paused, options)
}
