import { apiUrl, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

/** UI tab filter for `GET /api/metrics/admin/transactions/`. */
export type AdminTransactionTabFilter =
  | 'all'
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type AdminTransactionStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type AdminTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'disbursement'
  | 'repayment'
  | 'fee'

export type AdminTransactionFlow = 'in' | 'out' | 'neutral'

export type AdminTransactionModalPayload = {
  summaryLabel: string
  amountDisplay: string
  flow: AdminTransactionFlow
  partyLabel: string
  partyName: string
  transactionId: string
  dateTime: string
  transactionType: string
  status: string
  transactionAmount: string
  feesDeducted: string
  netReceived: string
  walletAddress: string
  walletAddressFull: string | null
  network: string
  transactionHash: string | null
}

export type AdminTransactionRow = {
  id: string
  transactionId: string
  type: AdminTransactionType
  typeLabel: string
  status: AdminTransactionStatus
  statusLabel: string
  detail: string
  amount: string
  amountDisplay: string
  date: string
  dateDisplay: string
  modal: AdminTransactionModalPayload
}

export type AdminTransactionsSummary = {
  deposits: string
  withdrawals: string
  disbursements: string
  repayments: string
}

export type AdminTransactionsListResult = {
  summary: AdminTransactionsSummary
  results: AdminTransactionRow[]
  total: number
}

export type FetchAdminTransactionsParams = {
  status?: AdminTransactionTabFilter
  type?: AdminTransactionType | 'all'
  search?: string
  limit?: number
  offset?: number
}

const TRANSACTIONS_LIST_PATH = '/metrics/admin/transactions/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for admin transactions API request.')
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

function pickNullableStr(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key]
    if (v === null) return null
    if (typeof v === 'string') return v.trim() || null
  }
  return null
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

function normalizeTransactionStatus(raw: string): AdminTransactionStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'pending') return 'pending'
  if (t === 'under_review' || t === 'under review') return 'under_review'
  if (t === 'approved') return 'approved'
  if (t === 'rejected') return 'rejected'
  return 'pending'
}

function normalizeTransactionType(raw: string): AdminTransactionType {
  const t = raw.trim().toLowerCase()
  if (t === 'deposit') return 'deposit'
  if (t === 'withdrawal') return 'withdrawal'
  if (t === 'disbursement') return 'disbursement'
  if (t === 'repayment') return 'repayment'
  if (t === 'fee') return 'fee'
  return 'deposit'
}

function normalizeTransactionFlow(raw: string): AdminTransactionFlow {
  const t = raw.trim().toLowerCase()
  if (t === 'in') return 'in'
  if (t === 'out') return 'out'
  return 'neutral'
}

function normalizeTransactionModal(raw: unknown): AdminTransactionModalPayload {
  const r = asRecord(raw)
  return {
    summaryLabel: pickStr(r, 'summaryLabel', 'summary_label') || 'Transaction',
    amountDisplay: pickStr(r, 'amountDisplay', 'amount_display') || '—',
    flow: normalizeTransactionFlow(pickStr(r, 'flow')),
    partyLabel: pickStr(r, 'partyLabel', 'party_label') || 'Party',
    partyName: pickStr(r, 'partyName', 'party_name') || '—',
    transactionId: pickStr(r, 'transactionId', 'transaction_id') || '—',
    dateTime: pickStr(r, 'dateTime', 'date_time') || '—',
    transactionType: pickStr(r, 'transactionType', 'transaction_type') || '—',
    status: pickStr(r, 'status') || '—',
    transactionAmount: pickStr(r, 'transactionAmount', 'transaction_amount') || '—',
    feesDeducted: pickStr(r, 'feesDeducted', 'fees_deducted') || '—',
    netReceived: pickStr(r, 'netReceived', 'net_received') || '—',
    walletAddress: pickStr(r, 'walletAddress', 'wallet_address') || '—',
    walletAddressFull: pickNullableStr(r, 'walletAddressFull', 'wallet_address_full'),
    network: pickStr(r, 'network') || '—',
    transactionHash: pickNullableStr(r, 'transactionHash', 'transaction_hash'),
  }
}

function normalizeTransactionRow(raw: unknown): AdminTransactionRow | null {
  const r = asRecord(raw)
  const id = pickStr(r, 'id')
  const transactionId = pickStr(r, 'transactionId', 'transaction_id')
  if (!id && !transactionId) return null

  const typeRaw = pickStr(r, 'type')
  const statusRaw = pickStr(r, 'status')

  return {
    id: id || transactionId,
    transactionId: transactionId || id,
    type: normalizeTransactionType(typeRaw),
    typeLabel: pickStr(r, 'typeLabel', 'type_label') || typeRaw || 'Transaction',
    status: normalizeTransactionStatus(statusRaw),
    statusLabel: pickStr(r, 'statusLabel', 'status_label') || statusRaw || 'Pending',
    detail: pickStr(r, 'detail') || '—',
    amount: pickStr(r, 'amount') || '0.00',
    amountDisplay: pickStr(r, 'amountDisplay', 'amount_display') || '—',
    date: pickStr(r, 'date') || '',
    dateDisplay: pickStr(r, 'dateDisplay', 'date_display') || pickStr(r, 'date') || '—',
    modal: normalizeTransactionModal(r.modal),
  }
}

function normalizeTransactionsSummary(raw: unknown): AdminTransactionsSummary {
  const r = asRecord(raw)
  return {
    deposits: pickStr(r, 'deposits') || '0.00',
    withdrawals: pickStr(r, 'withdrawals') || '0.00',
    disbursements: pickStr(r, 'disbursements') || '0.00',
    repayments: pickStr(r, 'repayments') || '0.00',
  }
}

function normalizeTransactionsListResponse(raw: unknown): AdminTransactionsListResult {
  const r = asRecord(raw)
  const results: AdminTransactionRow[] = []
  if (Array.isArray(r.results)) {
    for (const item of r.results) {
      const row = normalizeTransactionRow(item)
      if (row) results.push(row)
    }
  }
  return {
    summary: normalizeTransactionsSummary(r.summary),
    results,
    total: pickNumber(r, 'total'),
  }
}

/** `GET /api/metrics/admin/transactions/` — summary totals + filtered transaction rows. */
export async function fetchAdminTransactionsList(
  accessToken: string | null | undefined,
  params?: FetchAdminTransactionsParams,
): Promise<AdminTransactionsListResult> {
  const q = new URLSearchParams()
  q.set('status', params?.status ?? 'all')
  const type = params?.type?.trim()
  if (type && type !== 'all') q.set('type', type)
  const search = params?.search?.trim()
  if (search) q.set('search', search)
  const limit = Math.min(Math.max(params?.limit ?? 50, 1), 200)
  q.set('limit', String(limit))
  q.set('offset', String(params?.offset ?? 0))

  const url = `${apiUrl(TRANSACTIONS_LIST_PATH)}?${q.toString()}`
  const res = await fetchWithAuthRecovery(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeTransactionsListResponse(raw)
}
