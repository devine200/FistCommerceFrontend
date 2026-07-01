import { apiUrl } from '@/api/client'
import { parseAdminWriteResponse } from '@/api/adminActionResponse'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import {
  normalizeProposalDetail,
  normalizeProposalListRow,
  normalizeSigningPayload,
} from '@/api/multisig/normalize'
import type {
  ExecuteProposalResult,
  ProposalDetail,
  ProposalListRow,
  ProposalStatus,
  SigningPayload,
  OperationType,
} from '@/api/types/multisig'

const PROPOSALS_PATH = '/multisig/proposals/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for multisig API request.')
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

export type FetchMultisigProposalsParams = {
  status?: ProposalStatus | 'all'
  operationType?: OperationType | 'all'
}

/** `GET /api/multisig/proposals/` */
export async function fetchMultisigProposals(
  accessToken: string | null | undefined,
  params?: FetchMultisigProposalsParams,
): Promise<ProposalListRow[]> {
  const q = new URLSearchParams()
  const status = params?.status?.trim()
  if (status && status !== 'all') q.set('status', status)
  const op = params?.operationType?.trim()
  if (op && op !== 'all') q.set('operation_type', op)

  const suffix = q.toString() ? `?${q.toString()}` : ''
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}${suffix}`), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await res.json()
  const r = asRecord(raw)
  const rows: ProposalListRow[] = []
  const list = Array.isArray(r.results) ? r.results : Array.isArray(raw) ? raw : []
  for (const item of list) {
    const row = normalizeProposalListRow(item)
    if (row) rows.push(row)
  }
  return rows
}

/** `GET /api/multisig/proposals/{id}/` */
export async function fetchMultisigProposalDetail(
  accessToken: string | null | undefined,
  proposalId: string,
): Promise<ProposalDetail> {
  const id = proposalId.trim()
  if (!id) throw new Error('Missing proposal id.')
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}${encodeURIComponent(id)}/`), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await res.json()
  const detail = normalizeProposalDetail(raw)
  if (!detail) throw new Error('Proposal detail response was missing required fields.')
  return detail
}

/** `GET /api/multisig/proposals/{id}/signing-payload/` */
export async function fetchMultisigSigningPayload(
  accessToken: string | null | undefined,
  proposalId: string,
): Promise<SigningPayload> {
  const id = proposalId.trim()
  if (!id) throw new Error('Missing proposal id.')
  const res = await fetchWithAuthRecovery(
    apiUrl(`${PROPOSALS_PATH}${encodeURIComponent(id)}/signing-payload/`),
    {
      method: 'GET',
      headers: authHeaders(accessToken),
    },
  )
  const raw = await res.json()
  const payload = normalizeSigningPayload(raw)
  if (!payload) throw new Error('Signing payload response was missing required fields.')
  return payload
}

/** `POST /api/multisig/proposals/{id}/sign/` */
export async function postMultisigProposalSign(
  accessToken: string | null | undefined,
  proposalId: string,
  params: { signerAddress: string; signature: string },
): Promise<void> {
  const id = proposalId.trim()
  if (!id) throw new Error('Missing proposal id.')
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}${encodeURIComponent(id)}/sign/`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      signer_address: params.signerAddress.trim(),
      signature: params.signature.trim(),
    }),
  })
  await parseAdminWriteResponse(res)
}

/** `POST /api/multisig/proposals/{id}/execute/` */
export async function postMultisigProposalExecute(
  accessToken: string | null | undefined,
  proposalId: string,
): Promise<ExecuteProposalResult> {
  const id = proposalId.trim()
  if (!id) throw new Error('Missing proposal id.')
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}${encodeURIComponent(id)}/execute/`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({}),
  })
  const outcome = await parseAdminWriteResponse(res)
  const data = outcome.raw
  return {
    message: outcome.message,
    txHash: outcome.kind === 'completed' ? outcome.txHash ?? pickStr(data, 'tx_hash', 'txHash') : '',
    postExecuteSync: outcome.kind === 'completed' ? outcome.postExecuteSync : undefined,
  }
}

/** `POST /api/multisig/proposals/{id}/cancel/` */
export async function postMultisigProposalCancel(
  accessToken: string | null | undefined,
  proposalId: string,
): Promise<void> {
  const id = proposalId.trim()
  if (!id) throw new Error('Missing proposal id.')
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}${encodeURIComponent(id)}/cancel/`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({}),
  })
  await parseAdminWriteResponse(res)
}

/** `POST /api/multisig/proposals/withdrawal-approve/` */
export async function postMultisigCreateWithdrawalApproveProposal(
  accessToken: string | null | undefined,
  body: { requestId: string; user?: string },
) {
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}withdrawal-approve/`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      request_id: body.requestId.trim(),
      ...(body.user?.trim() ? { user: body.user.trim() } : {}),
    }),
  })
  return parseAdminWriteResponse(res)
}

export type MultisigKycStatusCreateBody = {
  wallet: string
  status: 'verified' | 'rejected'
  userRole: 'investor' | 'merchant'
}

/** `POST /api/multisig/proposals/kyc-status/` */
export async function postMultisigCreateKycStatusProposal(
  accessToken: string | null | undefined,
  body: MultisigKycStatusCreateBody,
) {
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}kyc-status/`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      wallet: body.wallet.trim(),
      status: body.status,
      user_role: body.userRole,
    }),
  })
  return parseAdminWriteResponse(res)
}

/** `POST /api/multisig/proposals/risk-tier/` */
export async function postMultisigCreateRiskTierProposal(
  accessToken: string | null | undefined,
  body: Record<string, unknown>,
  options?: { signal?: AbortSignal },
) {
  const res = await fetchWithAuthRecovery(apiUrl(`${PROPOSALS_PATH}risk-tier/`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify(body),
    signal: options?.signal,
  })
  return parseAdminWriteResponse(res)
}
