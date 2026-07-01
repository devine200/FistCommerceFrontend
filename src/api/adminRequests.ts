import { parseAdminWriteResponse, type AdminWriteOutcome } from '@/api/adminActionResponse'
import { apiUrl, parseJsonResponse } from '@/api/client'
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
  id: string
  requestKey: string
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

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

function normalizeRequestStatus(raw: string): AdminRequestStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'approved') return 'approved'
  if (t === 'rejected') return 'rejected'
  if (t === 'pending_governance' || t === 'pending governance') return 'pending'
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
  if (t === 'disbursement') return 'disbursement'
  return 'withdrawal'
}

function normalizeRequestParty(raw: unknown): AdminRequestParty {
  const r = asRecord(raw)
  return {
    displayName: pickStr(r, 'displayName', 'display_name') || '—',
    wallet: pickStr(r, 'wallet') || '—',
  }
}

function normalizeRequestActions(raw: unknown): AdminRequestActions {
  const r = asRecord(raw)
  return {
    canApprove: pickBool(r, 'canApprove', 'can_approve'),
    canReject: pickBool(r, 'canReject', 'can_reject'),
  }
}

function normalizeRequestRow(raw: unknown): AdminRequestRow | null {
  const r = asRecord(raw)
  const requestKey = pickStr(r, 'requestKey', 'request_key', 'requestId', 'request_id')
  const id = pickStr(r, 'id', 'transactionId', 'transaction_id') || requestKey
  if (!id && !requestKey) return null

  const typeRaw = pickStr(r, 'type')
  const statusRaw = pickStr(r, 'status', 'statusLabel', 'status_label')

  return {
    id: id || requestKey,
    requestKey: requestKey || id,
    type: normalizeRequestType(typeRaw),
    typeLabel: pickStr(r, 'typeLabel', 'type_label') || typeRaw || 'Request',
    party: normalizeRequestParty(r.party),
    amount: pickStr(r, 'amount') || '0.00',
    amountDisplay: pickStr(r, 'amountDisplay', 'amount_display') || '—',
    date: pickStr(r, 'date') || '',
    dateDisplay: pickStr(r, 'dateDisplay', 'date_display') || pickStr(r, 'date') || '—',
    status: normalizeRequestStatus(statusRaw),
    statusLabel: pickStr(r, 'statusLabel', 'status_label') || statusRaw || 'Pending',
    actions: normalizeRequestActions(r.actions),
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

function encodeRequestKey(requestKey: string): string {
  const key = requestKey.trim()
  if (!key) throw new Error('Missing request key.')
  return encodeURIComponent(key)
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

/** `POST /api/metrics/admin/requests/withdrawals/{requestKey}/approve/` */
export async function postApproveWithdrawalRequest(
  accessToken: string | null | undefined,
  requestKey: string,
  options?: { user?: string; signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const key = encodeRequestKey(requestKey)
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

/** `POST /api/metrics/admin/requests/withdrawals/{requestKey}/reject/` */
export async function postRejectWithdrawalRequest(
  accessToken: string | null | undefined,
  requestKey: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const key = encodeRequestKey(requestKey)
  const res = await fetchWithAuthRecovery(
    apiUrl(`${REQUESTS_LIST_PATH}withdrawals/${key}/reject/`),
    {
      method: 'POST',
      headers: jsonAuthHeaders(accessToken),
      body: JSON.stringify({}),
      signal: options?.signal,
    },
  )
  await parseJsonResponse<unknown>(res)
}

/** `POST /api/metrics/admin/requests/disbursements/{requestKey}/approve/` */
export async function postApproveDisbursementRequest(
  accessToken: string | null | undefined,
  requestKey: string,
  options?: { signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const key = encodeRequestKey(requestKey)
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

/** `POST /api/metrics/admin/requests/disbursements/{requestKey}/reject/` */
export async function postRejectDisbursementRequest(
  accessToken: string | null | undefined,
  requestKey: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const key = encodeRequestKey(requestKey)
  const res = await fetchWithAuthRecovery(
    apiUrl(`${REQUESTS_LIST_PATH}disbursements/${key}/reject/`),
    {
      method: 'POST',
      headers: jsonAuthHeaders(accessToken),
      body: JSON.stringify({}),
      signal: options?.signal,
    },
  )
  await parseJsonResponse<unknown>(res)
}
