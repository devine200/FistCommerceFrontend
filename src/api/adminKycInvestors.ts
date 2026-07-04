import { apiUrl, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

/** UI tab filter sent as `status` query param to `GET /api/kyc/admin/investors/`. */
export type AdminInvestorsTabFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected'

/** Row status from admin investors list/detail API. */
export type AdminInvestorListStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export type AdminInvestorParty = {
  displayName: string
  wallet: string
}

export type AdminInvestorListRow = {
  investorUserId: number
  investor: AdminInvestorParty
  invested: string
  earnings: string
  amountWithdrawn: string
  status: AdminInvestorListStatus
  statusLabel: string
  receivablesCount: number
  pendingMultisigProposalId: string | null
}

export type AdminInvestorsCounts = {
  totalInvestors: number
  totalInvested: string
  totalEarningsPaid: string
  frozenAccounts: number
}

export type AdminInvestorsListResult = {
  counts: AdminInvestorsCounts
  results: AdminInvestorListRow[]
  total: number
}

export type AdminInvestorProfileHeader = {
  investorUserId: number
  kycId: string | null
  displayName: string
  wallet: string
  kycStatus: AdminInvestorListStatus
  kycStatusLabel: string
  kycVerified: boolean
  reviewed: boolean
  dateJoined: string | null
  accountStatus: string
  accountStatusLabel: string
  pendingMultisigProposalId: string | null
}

export type AdminInvestorProfileSummary = {
  totalInvestedAmount: string
  activeInvestmentsTotal: string
  totalReturnsEarned: string
  availableBalance: string
  amountWithdrawn: string
}

export type AdminInvestorInvestmentLineRow = {
  id: string
  title: string
  date: string
  amount: string
  transactionHash: string | null
}

export type AdminInvestorActivityLineRow = {
  id: string
  activityType: string
  title: string
  date: string
  amount: string
  amountTone: string
  transactionHash: string | null
}

export type AdminInvestorProfileSection<T> = {
  count: number
  results: T[]
}

export type AdminInvestorProfileResult = {
  profile: AdminInvestorProfileHeader
  summary: AdminInvestorProfileSummary
  activeInvestments: AdminInvestorProfileSection<AdminInvestorInvestmentLineRow>
  investmentHistory: AdminInvestorProfileSection<AdminInvestorInvestmentLineRow>
  activity: AdminInvestorProfileSection<AdminInvestorActivityLineRow>
}

const ADMIN_INVESTORS_LIST_PATH = '/kyc/admin/investors/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for admin investors API request.')
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
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (v === null) return null
  }
  return null
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v)
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

function normalizeListStatus(raw: string): AdminInvestorListStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'pending') return 'pending'
  if (t === 'under_review' || t === 'under review') return 'under_review'
  if (t === 'approved' || t === 'verified') return 'approved'
  if (t === 'rejected') return 'rejected'
  return 'pending'
}

function normalizeInvestorParty(raw: unknown): AdminInvestorParty {
  const r = asRecord(raw)
  const wallet = pickStr(r, 'wallet')
  const displayName =
    pickStr(r, 'displayName', 'display_name') ||
    pickStr(r, 'fullname', 'full_name') ||
    wallet
  return { displayName, wallet }
}

function normalizeInvestorListRow(raw: unknown): AdminInvestorListRow | null {
  const r = asRecord(raw)
  const investorUserId = pickNumber(r, 'investorUserId', 'investor_user_id')
  if (investorUserId == null) return null
  const status = normalizeListStatus(pickStr(r, 'status'))
  return {
    investorUserId,
    investor: normalizeInvestorParty(r.investor),
    invested: pickStr(r, 'invested') || '0.00',
    earnings: pickStr(r, 'earnings') || '0.00',
    amountWithdrawn: pickStr(r, 'amountWithdrawn', 'amount_withdrawn') || '0.00',
    status,
    statusLabel:
      pickStr(r, 'statusLabel', 'status_label') ||
      status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    receivablesCount: pickNumber(r, 'receivablesCount', 'receivables_count') ?? 0,
    pendingMultisigProposalId: pickNullableStr(
      r,
      'pendingMultisigProposalId',
      'pending_multisig_proposal_id',
    ),
  }
}

function normalizeInvestorsCounts(raw: unknown): AdminInvestorsCounts {
  const r = asRecord(raw)
  return {
    totalInvestors: pickNumber(r, 'totalInvestors', 'total_investors') ?? 0,
    totalInvested: pickStr(r, 'totalInvested', 'total_invested') || '0.00',
    totalEarningsPaid: pickStr(r, 'totalEarningsPaid', 'total_earnings_paid') || '0.00',
    frozenAccounts: pickNumber(r, 'frozenAccounts', 'frozen_accounts') ?? 0,
  }
}

function normalizeAdminInvestorsListResponse(raw: unknown): AdminInvestorsListResult {
  const r = asRecord(raw)
  const results: AdminInvestorListRow[] = []
  if (Array.isArray(r.results)) {
    for (const item of r.results) {
      const row = normalizeInvestorListRow(item)
      if (row) results.push(row)
    }
  }
  return {
    counts: normalizeInvestorsCounts(r.counts),
    results,
    total: pickNumber(r, 'total', 'count') ?? results.length,
  }
}

function normalizeInvestmentLineRow(raw: unknown): AdminInvestorInvestmentLineRow | null {
  const r = asRecord(raw)
  const id = pickStr(r, 'id')
  if (!id) return null
  return {
    id,
    title: pickStr(r, 'title') || 'Investment',
    date: pickStr(r, 'date') || '',
    amount: pickStr(r, 'amount') || '0.00',
    transactionHash: pickNullableStr(r, 'transactionHash', 'transaction_hash'),
  }
}

function normalizeActivityLineRow(raw: unknown): AdminInvestorActivityLineRow | null {
  const r = asRecord(raw)
  const id = pickStr(r, 'id')
  if (!id) return null
  return {
    id,
    activityType: pickStr(r, 'activityType', 'activity_type') || 'investment',
    title: pickStr(r, 'title') || 'Activity',
    date: pickStr(r, 'date') || '',
    amount: pickStr(r, 'amount') || '0.00',
    amountTone: pickStr(r, 'amountTone', 'amount_tone') || 'neutral',
    transactionHash: pickNullableStr(r, 'transactionHash', 'transaction_hash'),
  }
}

function normalizeInvestmentSection(raw: unknown): AdminInvestorProfileSection<AdminInvestorInvestmentLineRow> {
  const r = asRecord(raw)
  const results: AdminInvestorInvestmentLineRow[] = []
  if (Array.isArray(r.results)) {
    for (const item of r.results) {
      const row = normalizeInvestmentLineRow(item)
      if (row) results.push(row)
    }
  }
  return {
    count: pickNumber(r, 'count') ?? results.length,
    results,
  }
}

function normalizeActivitySection(raw: unknown): AdminInvestorProfileSection<AdminInvestorActivityLineRow> {
  const r = asRecord(raw)
  const results: AdminInvestorActivityLineRow[] = []
  if (Array.isArray(r.results)) {
    for (const item of r.results) {
      const row = normalizeActivityLineRow(item)
      if (row) results.push(row)
    }
  }
  return {
    count: pickNumber(r, 'count') ?? results.length,
    results,
  }
}

function normalizeProfileHeader(raw: unknown): AdminInvestorProfileHeader | null {
  const r = asRecord(raw)
  const investorUserId = pickNumber(r, 'investorUserId', 'investor_user_id')
  if (investorUserId == null) return null
  const wallet = pickStr(r, 'wallet')
  return {
    investorUserId,
    kycId: pickNullableStr(r, 'kycId', 'kyc_id'),
    displayName: pickStr(r, 'displayName', 'display_name') || wallet,
    wallet,
    kycStatus: normalizeListStatus(pickStr(r, 'kycStatus', 'kyc_status', 'status')),
    kycStatusLabel:
      pickStr(r, 'kycStatusLabel', 'kyc_status_label') ||
      pickStr(r, 'status') ||
      'Pending',
    kycVerified: pickBool(r, 'kycVerified', 'kyc_verified'),
    reviewed: pickBool(r, 'reviewed'),
    dateJoined: pickNullableStr(r, 'dateJoined', 'date_joined'),
    accountStatus: pickStr(r, 'accountStatus', 'account_status') || 'active',
    accountStatusLabel: pickStr(r, 'accountStatusLabel', 'account_status_label') || 'Active',
    pendingMultisigProposalId: pickNullableStr(
      r,
      'pendingMultisigProposalId',
      'pending_multisig_proposal_id',
    ),
  }
}

function normalizeProfileSummary(raw: unknown): AdminInvestorProfileSummary {
  const r = asRecord(raw)
  return {
    totalInvestedAmount: pickStr(r, 'totalInvestedAmount', 'total_invested_amount') || '0.00',
    activeInvestmentsTotal: pickStr(r, 'activeInvestmentsTotal', 'active_investments_total') || '0.00',
    totalReturnsEarned: pickStr(r, 'totalReturnsEarned', 'total_returns_earned') || '0.00',
    availableBalance: pickStr(r, 'availableBalance', 'available_balance') || '0.00',
    amountWithdrawn: pickStr(r, 'amountWithdrawn', 'amount_withdrawn') || '0.00',
  }
}

function normalizeAdminInvestorProfileResponse(raw: unknown): AdminInvestorProfileResult | null {
  const r = asRecord(raw)
  const profile = normalizeProfileHeader(r.profile)
  if (!profile) return null
  return {
    profile,
    summary: normalizeProfileSummary(r.summary),
    activeInvestments: normalizeInvestmentSection(r.activeInvestments ?? r.active_investments),
    investmentHistory: normalizeInvestmentSection(r.investmentHistory ?? r.investment_history),
    activity: normalizeActivitySection(r.activity),
  }
}

export type FetchAdminInvestorsParams = {
  status?: AdminInvestorsTabFilter
  search?: string
  limit?: number
  offset?: number
}

export type FetchAdminInvestorProfileParams = {
  activeSearch?: string
  historySearch?: string
  activitySearch?: string
  activityType?: 'all' | 'deposits' | 'withdrawals'
  activeLimit?: number
  activeOffset?: number
  historyLimit?: number
  historyOffset?: number
  activityLimit?: number
  activityOffset?: number
}

/** `GET /api/kyc/admin/investors/` — summary counts + filtered investor list. */
export async function fetchAdminInvestorsList(
  accessToken: string | null | undefined,
  params?: FetchAdminInvestorsParams,
): Promise<AdminInvestorsListResult> {
  const q = new URLSearchParams()
  q.set('status', params?.status ?? 'all')
  const search = params?.search?.trim()
  if (search) q.set('search', search)
  q.set('limit', String(params?.limit ?? 50))
  q.set('offset', String(params?.offset ?? 0))

  const url = `${apiUrl(ADMIN_INVESTORS_LIST_PATH)}?${q.toString()}`
  const res = await fetchWithAuthRecovery(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeAdminInvestorsListResponse(raw)
}

/** `GET /api/kyc/admin/investors/{investorUserId}/` — investor profile detail. */
export async function fetchAdminInvestorDetail(
  accessToken: string | null | undefined,
  investorUserId: number | string,
  params?: FetchAdminInvestorProfileParams,
): Promise<AdminInvestorProfileResult> {
  const id = String(investorUserId).trim()
  if (!id) throw new Error('Missing investor id.')

  const q = new URLSearchParams()
  const activeSearch = params?.activeSearch?.trim()
  const historySearch = params?.historySearch?.trim()
  const activitySearch = params?.activitySearch?.trim()
  if (activeSearch) q.set('activeSearch', activeSearch)
  if (historySearch) q.set('historySearch', historySearch)
  if (activitySearch) q.set('activitySearch', activitySearch)
  if (params?.activityType && params.activityType !== 'all') {
    q.set('activityType', params.activityType)
  }
  if (params?.activeLimit != null) q.set('activeLimit', String(params.activeLimit))
  if (params?.activeOffset != null) q.set('activeOffset', String(params.activeOffset))
  if (params?.historyLimit != null) q.set('historyLimit', String(params.historyLimit))
  if (params?.historyOffset != null) q.set('historyOffset', String(params.historyOffset))
  if (params?.activityLimit != null) q.set('activityLimit', String(params.activityLimit))
  if (params?.activityOffset != null) q.set('activityOffset', String(params.activityOffset))

  const query = q.toString()
  const url = query
    ? `${apiUrl(`${ADMIN_INVESTORS_LIST_PATH}${encodeURIComponent(id)}/`)}?${query}`
    : apiUrl(`${ADMIN_INVESTORS_LIST_PATH}${encodeURIComponent(id)}/`)

  const res = await fetchWithAuthRecovery(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  const detail = normalizeAdminInvestorProfileResponse(raw)
  if (!detail) {
    throw new Error('Investor profile response was missing required fields.')
  }
  return detail
}
