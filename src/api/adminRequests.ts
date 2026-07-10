import { parseAdminWriteResponse, type AdminWriteOutcome } from '@/api/adminActionResponse'
import { apiUrl, parseApiErrorResponse, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

/** Status filter for `GET /api/metrics/admin/requests/`. */
export type AdminRequestStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export type AdminRequestTypeFilter = 'all' | 'withdrawal' | 'disbursement'

export type AdminRequestStatus = 'pending' | 'approved' | 'rejected'

export type AdminRequestType = 'withdrawal' | 'disbursement'

export type AdminRequestParty = {
  displayName: string
  wallet: string
}

export type AdminRequestActions = {
  canApprove: boolean
  canReject: boolean
}

export type AdminRequestGovernanceStatus =
  | 'none'
  | 'pending_signatures'
  | 'ready'
  | 'executed'
  | 'failed'
  | 'cancelled'

export type AdminRequestRow = {
  /** Short display id from API `id` — never used in approve/reject URLs. */
  id: string
  /** Disbursement only: full receivable id (from API `requestKey`). */
  receivableId: string | null
  /** Withdrawal only: full withdrawal request id (from API `requestKey`). */
  withdrawalRequestId: string | null
  /** Approve/reject path param (always API `requestKey` when present). */
  actionId: string
  type: AdminRequestType
  typeLabel: string
  party: AdminRequestParty
  amount: string
  amountDisplay: string
  date: string
  dateDisplay: string
  status: AdminRequestStatus
  statusLabel: string
  actions: AdminRequestActions
  pendingGovernanceProposalId: string | null
  governanceStatus: AdminRequestGovernanceStatus
}

export type AdminRequestCounts = {
  pending: number
  approved: number
  rejected: number
  withdrawalVolume: string
}

export type AdminRequestsListResult = {
  counts: AdminRequestCounts
  results: AdminRequestRow[]
  total: number
}

export type FetchAdminRequestsParams = {
  status?: AdminRequestStatusFilter
  type?: AdminRequestTypeFilter
  search?: string
  limit?: number
  offset?: number
}

const REQUESTS_LIST_PATH = '/metrics/admin/requests/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for admin requests API request.')
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

function pickScalarId(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  return ''
}

function isShortenedDisplayId(value: string): boolean {
  const v = value.trim()
  if (!v) return true
  if (v.includes('…') || v.includes('...')) return true
  if (/^0x[0-9a-fA-F]+$/.test(v) && v.length < 66) return true
  return false
}

function isActionableId(value: string): boolean {
  return Boolean(value.trim()) && !isShortenedDisplayId(value)
}

function pickFirstActionableId(...candidates: string[]): string {
  for (const candidate of candidates) {
    if (isActionableId(candidate)) return candidate.trim()
  }
  return ''
}

/**
 * `GET /api/metrics/admin/requests/` — `requestKey` is the full on-chain key for approve/reject.
 * Disbursement → receivable id; withdrawal → withdrawal request id. Never use shortened `id`.
 */
function pickListRequestKey(record: Record<string, unknown>): string {
  return pickFirstActionableId(pickScalarId(record, 'requestKey', 'request_key'))
}

function normalizeRequestStatus(raw: string): AdminRequestStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'approved' || t === 'executed' || t === 'completed' || t === 'paid_out' || t === 'paid out') {
    return 'approved'
  }
  if (t === 'rejected') return 'rejected'
  if (t === 'pending_governance' || t === 'pending governance' || t === 'pending') return 'pending'
  return 'pending'
}

function normalizeGovernanceStatus(raw: string): AdminRequestGovernanceStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'pending_signatures') return 'pending_signatures'
  if (t === 'ready') return 'ready'
  if (t === 'executed') return 'executed'
  if (t === 'failed') return 'failed'
  if (t === 'cancelled' || t === 'canceled') return 'cancelled'
  return 'none'
}

function normalizeRequestType(raw: string): AdminRequestType {
  const t = raw.trim().toLowerCase()
  if (t === 'disbursement' || t === 'payout' || t === 'merchant_payout' || t === 'merchant_disbursement') {
    return 'disbursement'
  }
  return 'withdrawal'
}

function normalizeRequestParty(raw: unknown): AdminRequestParty {
  const r = asRecord(raw)
  return {
    displayName: pickStr(r, 'displayName', 'display_name') || '—',
    wallet: pickStr(r, 'wallet') || '—',
  }
}

function pickBoolOptional(record: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'boolean') return v
  }
  return undefined
}

function normalizeRequestActions(
  row: Record<string, unknown>,
  status: AdminRequestStatus,
  hasActionId: boolean,
): AdminRequestActions {
  const nested = asRecord(row.actions)
  const explicitApprove =
    pickBoolOptional(nested, 'canApprove', 'can_approve') ??
    pickBoolOptional(row, 'canApprove', 'can_approve')
  const explicitReject =
    pickBoolOptional(nested, 'canReject', 'can_reject') ??
    pickBoolOptional(row, 'canReject', 'can_reject')

  if (status === 'pending' && hasActionId) {
    return {
      canApprove: explicitApprove ?? true,
      canReject: explicitReject ?? true,
    }
  }

  if (status === 'approved' || status === 'rejected') {
    return {
      canApprove: false,
      canReject: false,
    }
  }

  return {
    canApprove: explicitApprove ?? false,
    canReject: explicitReject ?? false,
  }
}

/** Approve/reject path param from a raw list row (`requestKey`). */
export function resolveAdminRequestActionId(
  raw: Record<string, unknown>,
  _type?: AdminRequestType,
): string {
  return pickListRequestKey(raw)
}

/** @deprecated Use `resolveAdminRequestActionId` */
export function resolveAdminRequestActionKey(
  raw: Record<string, unknown>,
  type: AdminRequestType,
): string {
  return resolveAdminRequestActionId(raw, type)
}

/** Approve/reject path param from a normalized row. */
export function adminRequestRowActionId(
  row: Pick<AdminRequestRow, 'actionId' | 'receivableId' | 'withdrawalRequestId'>,
): string {
  return pickFirstActionableId(row.actionId, row.receivableId ?? '', row.withdrawalRequestId ?? '')
}

/** Path segment for approve/reject on a normalized queue row. */
export function adminRequestActionId(row: Pick<AdminRequestRow, 'type' | 'actionId'>): string {
  const id = row.actionId.trim()
  if (!id) {
    throw new Error(
      row.type === 'disbursement'
        ? 'Missing receivable id for disbursement request.'
        : 'Missing withdrawal request id.',
    )
  }
  return id
}

function normalizeRequestRow(raw: unknown): AdminRequestRow | null {
  const r = asRecord(raw)
  const typeRaw = pickStr(r, 'type')
  const type = normalizeRequestType(typeRaw)
  const requestKey = pickListRequestKey(r)
  const receivableId = type === 'disbursement' ? requestKey : ''
  const withdrawalRequestId = type === 'withdrawal' ? requestKey : ''
  const actionId = requestKey

  const displayId = pickScalarId(r, 'id') || pickStr(r, 'typeLabel', 'type_label')
  if (!displayId && !actionId) return null

  const statusRaw = pickStr(r, 'status') || pickStr(r, 'statusLabel', 'status_label')
  const status = normalizeRequestStatus(statusRaw)

  return {
    id: displayId,
    receivableId: receivableId || null,
    withdrawalRequestId: withdrawalRequestId || null,
    actionId,
    type,
    typeLabel: pickStr(r, 'typeLabel', 'type_label') || typeRaw || 'Request',
    party: normalizeRequestParty(r.party),
    amount: pickStr(r, 'amount') || '0.00',
    amountDisplay: pickStr(r, 'amountDisplay', 'amount_display') || '—',
    date: pickStr(r, 'date') || '',
    dateDisplay: pickStr(r, 'dateDisplay', 'date_display') || pickStr(r, 'date') || '—',
    status,
    statusLabel: pickStr(r, 'statusLabel', 'status_label') || statusRaw || 'Pending',
    actions: normalizeRequestActions(r, status, Boolean(actionId)),
    pendingGovernanceProposalId: pickNullableStr(
      r,
      'pendingGovernanceProposalId',
      'pending_governance_proposal_id',
      'pendingMultisigProposalId',
      'pending_multisig_proposal_id',
    ),
    governanceStatus: normalizeGovernanceStatus(
      pickStr(r, 'governanceStatus', 'governance_status') ||
        (pickNullableStr(r, 'pendingGovernanceProposalId', 'pending_governance_proposal_id')
          ? 'pending_signatures'
          : 'none'),
    ),
  }
}

function pickNullableStr(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key]
    if (v === null) return null
    if (typeof v === 'string') return v.trim() || null
  }
  return null
}

function normalizeRequestCounts(raw: unknown): AdminRequestCounts {
  const r = asRecord(raw)
  return {
    pending: pickNumber(r, 'pending'),
    approved: pickNumber(r, 'approved'),
    rejected: pickNumber(r, 'rejected'),
    withdrawalVolume: pickStr(r, 'withdrawalVolume', 'withdrawal_volume') || '0.00',
  }
}

function normalizeRequestsListResponse(raw: unknown): AdminRequestsListResult {
  const r = asRecord(raw)
  const results: AdminRequestRow[] = []

  const list = Array.isArray(r.results)
    ? r.results
    : Array.isArray(r.requests)
      ? r.requests
      : Array.isArray(r.items)
        ? r.items
        : Array.isArray(raw)
          ? raw
          : []

  for (const item of list) {
    const row = normalizeRequestRow(item)
    if (row) results.push(row)
  }

  const countsSource = r.counts ?? r.summary
  const total = pickNumber(r, 'total', 'count') || results.length

  return {
    counts: normalizeRequestCounts(countsSource),
    results,
    total,
  }
}

function encodePathParam(value: string): string {
  const key = value.trim()
  if (!key) throw new Error('Missing path parameter.')
  return encodeURIComponent(key)
}

/** Reject endpoints return 201 with an empty body; tolerate non-JSON success payloads. */
async function parseAdminVoidMutationResponse(res: Response): Promise<void> {
  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }
  const text = await res.text()
  if (!text.trim()) return
  try {
    JSON.parse(text)
  } catch {
    // ignore
  }
}

/** `GET /api/metrics/admin/requests/` — summary counts + filtered request queue rows. */
export async function fetchAdminRequestsList(
  accessToken: string | null | undefined,
  params?: FetchAdminRequestsParams,
): Promise<AdminRequestsListResult> {
  const q = new URLSearchParams()
  q.set('status', params?.status ?? 'all')
  const type = params?.type?.trim()
  if (type && type !== 'all') q.set('type', type)
  const search = params?.search?.trim()
  if (search) q.set('search', search)
  const limit = Math.min(Math.max(params?.limit ?? 50, 1), 200)
  q.set('limit', String(limit))
  q.set('offset', String(params?.offset ?? 0))

  const url = `${apiUrl(REQUESTS_LIST_PATH)}?${q.toString()}`
  const res = await fetchWithAuthRecovery(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeRequestsListResponse(raw)
}

/** `POST /api/metrics/admin/requests/withdrawals/{request_id}/approve/` */
export async function postApproveWithdrawalRequest(
  accessToken: string | null | undefined,
  requestId: string,
  options?: { user?: string; signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const key = encodePathParam(requestId)
  const body: Record<string, string> = {}
  const user = options?.user?.trim()
  if (user) body.user = user

  const res = await fetchWithAuthRecovery(
    apiUrl(`${REQUESTS_LIST_PATH}withdrawals/${key}/approve/`),
    {
      method: 'POST',
      headers: jsonAuthHeaders(accessToken),
      body: JSON.stringify(body),
      signal: options?.signal,
    },
  )
  return parseAdminWriteResponse(res)
}

/** `POST /api/metrics/admin/requests/withdrawals/{request_id}/reject/` */
export async function postRejectWithdrawalRequest(
  accessToken: string | null | undefined,
  requestId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const key = encodePathParam(requestId)
  const res = await fetchWithAuthRecovery(
    apiUrl(`${REQUESTS_LIST_PATH}withdrawals/${key}/reject/`),
    {
      method: 'POST',
      headers: jsonAuthHeaders(accessToken),
      body: JSON.stringify({}),
      signal: options?.signal,
    },
  )
  await parseAdminVoidMutationResponse(res)
}

/** `POST /api/metrics/admin/requests/disbursements/{receivable_id}/approve/` */
export async function postApproveDisbursementRequest(
  accessToken: string | null | undefined,
  receivableId: string,
  options?: { signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const key = encodePathParam(receivableId)
  const res = await fetchWithAuthRecovery(
    apiUrl(`${REQUESTS_LIST_PATH}disbursements/${key}/approve/`),
    {
      method: 'POST',
      headers: jsonAuthHeaders(accessToken),
      body: JSON.stringify({}),
      signal: options?.signal,
    },
  )
  return parseAdminWriteResponse(res)
}

/** `POST /api/metrics/admin/requests/disbursements/{receivable_id}/reject/` */
export async function postRejectDisbursementRequest(
  accessToken: string | null | undefined,
  receivableId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const key = encodePathParam(receivableId)
  const res = await fetchWithAuthRecovery(
    apiUrl(`${REQUESTS_LIST_PATH}disbursements/${key}/reject/`),
    {
      method: 'POST',
      headers: jsonAuthHeaders(accessToken),
      body: JSON.stringify({}),
      signal: options?.signal,
    },
  )
  await parseAdminVoidMutationResponse(res)
}
