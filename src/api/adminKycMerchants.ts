import { apiUrl, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

/** UI tab filter sent as `status` query param to `GET /api/kyc/admin/merchants/`. */
export type AdminMerchantsTabFilter = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected'

/** Row status from admin merchants list/detail API. */
export type AdminMerchantListStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export type AdminMerchantParty = {
  displayName: string
  wallet: string
  walletShort: string
}

export type AdminMerchantListRow = {
  merchantUserId: number
  merchant: AdminMerchantParty
  industry: string
  totalLoans: string
  currentDebtOwed: string
  status: AdminMerchantListStatus
  receivablesCount: number
  pendingMultisigProposalId: string | null
}

export type AdminMerchantsCounts = {
  totalMerchants: number
  activeMerchants: number
  underReview: number
  rejectedMerchants: number
}

export type AdminMerchantsListResult = {
  counts: AdminMerchantsCounts
  results: AdminMerchantListRow[]
  total: number
}

export type AdminMerchantProfileHeader = {
  merchantUserId: number
  kycId: string | null
  displayName: string
  wallet: string
  businessName: string
  kycStatus: AdminMerchantListStatus
  kycStatusLabel: string
  registrationDate: string | null
  accountStatus: string
  accountStatusLabel: string
  pendingMultisigProposalId: string | null
}

export type AdminMerchantProfileSummary = {
  totalReceivablesSubmitted: number
  totalReceivablesFunded: number
  totalFundedAmount: string
  totalSettledAmount: string
  unpaidAmount: string
}

export type AdminMerchantRepaymentDue = {
  label: string | null
  tone: string
  dueDate: string | null
}

export type AdminMerchantRepaymentAmount = {
  total: string
  interest: string | null
}

export type AdminMerchantProfileReceivableRow = {
  loanId: string
  receivableName: string
  loanAmount: string
  apr: number | null
  repaymentDue: AdminMerchantRepaymentDue
  repaymentAmount: AdminMerchantRepaymentAmount
  debtStatus: string
  debtStatusLabel: string
}

export type AdminMerchantReceivableSection = {
  count: number
  results: AdminMerchantProfileReceivableRow[]
}

export type AdminMerchantProfileResult = {
  profile: AdminMerchantProfileHeader
  summary: AdminMerchantProfileSummary
  activeReceivables: AdminMerchantReceivableSection
  allReceivables: AdminMerchantReceivableSection
}

const ADMIN_MERCHANTS_LIST_PATH = '/kyc/admin/merchants/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for admin merchants API request.')
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

function normalizeListStatus(raw: string): AdminMerchantListStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'pending') return 'pending'
  if (t === 'under_review' || t === 'under review') return 'under_review'
  if (t === 'approved' || t === 'verified') return 'approved'
  if (t === 'rejected') return 'rejected'
  return 'pending'
}

function normalizeMerchantParty(raw: unknown, fallbackWallet = ''): AdminMerchantParty {
  const r = asRecord(raw)
  const wallet = pickStr(r, 'wallet') || fallbackWallet
  const displayName =
    pickStr(r, 'displayName', 'display_name') ||
    pickStr(r, 'fullname', 'full_name', 'businessName', 'business_name') ||
    wallet
  const walletShort = pickStr(r, 'walletShort', 'wallet_short') || wallet
  return { displayName, wallet, walletShort }
}

function normalizeMerchantListRow(raw: unknown): AdminMerchantListRow | null {
  const r = asRecord(raw)
  const merchantUserId = pickNumber(r, 'merchantUserId', 'merchant_user_id')
  if (merchantUserId == null) return null
  const merchantRaw = asRecord(r.merchant)
  return {
    merchantUserId,
    merchant: normalizeMerchantParty(merchantRaw),
    industry: pickStr(r, 'industry') || '—',
    totalLoans: pickStr(r, 'totalLoans', 'total_loans') || '0.00',
    currentDebtOwed: pickStr(r, 'currentDebtOwed', 'current_debt_owed') || '0.00',
    status: normalizeListStatus(pickStr(r, 'status')),
    receivablesCount: pickNumber(r, 'receivablesCount', 'receivables_count') ?? 0,
    pendingMultisigProposalId: pickNullableStr(
      r,
      'pendingMultisigProposalId',
      'pending_multisig_proposal_id',
    ),
  }
}

function normalizeMerchantsCounts(raw: unknown): AdminMerchantsCounts {
  const r = asRecord(raw)
  return {
    totalMerchants: pickNumber(r, 'totalMerchants', 'total_merchants') ?? 0,
    activeMerchants: pickNumber(r, 'activeMerchants', 'active_merchants') ?? 0,
    underReview: pickNumber(r, 'underReview', 'under_review') ?? 0,
    rejectedMerchants: pickNumber(r, 'rejectedMerchants', 'rejected_merchants') ?? 0,
  }
}

function normalizeAdminMerchantsListResponse(raw: unknown): AdminMerchantsListResult {
  const r = asRecord(raw)
  const results: AdminMerchantListRow[] = []
  if (Array.isArray(r.results)) {
    for (const item of r.results) {
      const row = normalizeMerchantListRow(item)
      if (row) results.push(row)
    }
  }
  return {
    counts: normalizeMerchantsCounts(r.counts),
    results,
    total: pickNumber(r, 'total', 'count') ?? results.length,
  }
}

function normalizeRepaymentDue(raw: unknown): AdminMerchantRepaymentDue {
  const r = asRecord(raw)
  return {
    label: pickNullableStr(r, 'label'),
    tone: pickStr(r, 'tone') || 'neutral',
    dueDate: pickNullableStr(r, 'dueDate', 'due_date'),
  }
}

function normalizeRepaymentAmount(raw: unknown): AdminMerchantRepaymentAmount {
  const r = asRecord(raw)
  return {
    total: pickStr(r, 'total') || '0.00',
    interest: pickNullableStr(r, 'interest'),
  }
}

function normalizeProfileReceivableRow(raw: unknown): AdminMerchantProfileReceivableRow | null {
  const r = asRecord(raw)
  const loanId = pickStr(r, 'loanId', 'loan_id')
  if (!loanId) return null
  return {
    loanId,
    receivableName: pickStr(r, 'receivableName', 'receivable_name') || 'Receivable',
    loanAmount: pickStr(r, 'loanAmount', 'loan_amount') || '0.00',
    apr: pickNumber(r, 'apr'),
    repaymentDue: normalizeRepaymentDue(r.repaymentDue ?? r.repayment_due),
    repaymentAmount: normalizeRepaymentAmount(r.repaymentAmount ?? r.repayment_amount),
    debtStatus: pickStr(r, 'debtStatus', 'debt_status') || 'pending',
    debtStatusLabel: pickStr(r, 'debtStatusLabel', 'debt_status_label') || 'Pending',
  }
}

function normalizeReceivableSection(raw: unknown): AdminMerchantReceivableSection {
  const r = asRecord(raw)
  const results: AdminMerchantProfileReceivableRow[] = []
  if (Array.isArray(r.results)) {
    for (const item of r.results) {
      const row = normalizeProfileReceivableRow(item)
      if (row) results.push(row)
    }
  }
  return {
    count: pickNumber(r, 'count') ?? results.length,
    results,
  }
}

function normalizeProfileHeader(raw: unknown): AdminMerchantProfileHeader | null {
  const r = asRecord(raw)
  const merchantUserId = pickNumber(r, 'merchantUserId', 'merchant_user_id')
  if (merchantUserId == null) return null
  const wallet = pickStr(r, 'wallet')
  return {
    merchantUserId,
    kycId: pickNullableStr(r, 'kycId', 'kyc_id'),
    displayName: pickStr(r, 'displayName', 'display_name') || wallet,
    wallet,
    businessName: pickStr(r, 'businessName', 'business_name'),
    kycStatus: normalizeListStatus(pickStr(r, 'kycStatus', 'kyc_status', 'status')),
    kycStatusLabel:
      pickStr(r, 'kycStatusLabel', 'kyc_status_label') ||
      pickStr(r, 'status') ||
      'Pending',
    registrationDate: pickNullableStr(r, 'registrationDate', 'registration_date'),
    accountStatus: pickStr(r, 'accountStatus', 'account_status') || 'active',
    accountStatusLabel: pickStr(r, 'accountStatusLabel', 'account_status_label') || 'Active',
    pendingMultisigProposalId: pickNullableStr(
      r,
      'pendingMultisigProposalId',
      'pending_multisig_proposal_id',
    ),
  }
}

function normalizeProfileSummary(raw: unknown): AdminMerchantProfileSummary {
  const r = asRecord(raw)
  return {
    totalReceivablesSubmitted:
      pickNumber(r, 'totalReceivablesSubmitted', 'total_receivables_submitted') ?? 0,
    totalReceivablesFunded:
      pickNumber(r, 'totalReceivablesFunded', 'total_receivables_funded') ?? 0,
    totalFundedAmount: pickStr(r, 'totalFundedAmount', 'total_funded_amount') || '0.00',
    totalSettledAmount: pickStr(r, 'totalSettledAmount', 'total_settled_amount') || '0.00',
    unpaidAmount: pickStr(r, 'unpaidAmount', 'unpaid_amount') || '0.00',
  }
}

function normalizeAdminMerchantProfileResponse(raw: unknown): AdminMerchantProfileResult | null {
  const r = asRecord(raw)
  const profile = normalizeProfileHeader(r.profile)
  if (!profile) return null
  return {
    profile,
    summary: normalizeProfileSummary(r.summary),
    activeReceivables: normalizeReceivableSection(r.activeReceivables ?? r.active_receivables),
    allReceivables: normalizeReceivableSection(r.allReceivables ?? r.all_receivables),
  }
}

export type FetchAdminMerchantsParams = {
  status?: AdminMerchantsTabFilter
  search?: string
  limit?: number
  offset?: number
}

export type FetchAdminMerchantProfileParams = {
  activeSearch?: string
  allSearch?: string
  activeLimit?: number
  activeOffset?: number
  allLimit?: number
  allOffset?: number
}

/** `GET /api/kyc/admin/merchants/` — summary counts + filtered merchant list. */
export async function fetchAdminMerchantsList(
  accessToken: string | null | undefined,
  params?: FetchAdminMerchantsParams,
): Promise<AdminMerchantsListResult> {
  const q = new URLSearchParams()
  q.set('status', params?.status ?? 'all')
  const search = params?.search?.trim()
  if (search) q.set('search', search)
  q.set('limit', String(params?.limit ?? 50))
  q.set('offset', String(params?.offset ?? 0))

  const url = `${apiUrl(ADMIN_MERCHANTS_LIST_PATH)}?${q.toString()}`
  const res = await fetchWithAuthRecovery(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeAdminMerchantsListResponse(raw)
}

/** `GET /api/kyc/admin/merchants/{merchantUserId}/` — merchant profile detail. */
export async function fetchAdminMerchantDetail(
  accessToken: string | null | undefined,
  merchantUserId: number | string,
  params?: FetchAdminMerchantProfileParams,
): Promise<AdminMerchantProfileResult> {
  const id = String(merchantUserId).trim()
  if (!id) throw new Error('Missing merchant id.')

  const q = new URLSearchParams()
  const activeSearch = params?.activeSearch?.trim()
  const allSearch = params?.allSearch?.trim()
  if (activeSearch) q.set('activeSearch', activeSearch)
  if (allSearch) q.set('allSearch', allSearch)
  if (params?.activeLimit != null) q.set('activeLimit', String(params.activeLimit))
  if (params?.activeOffset != null) q.set('activeOffset', String(params.activeOffset))
  if (params?.allLimit != null) q.set('allLimit', String(params.allLimit))
  if (params?.allOffset != null) q.set('allOffset', String(params.allOffset))

  const query = q.toString()
  const url = query
    ? `${apiUrl(`${ADMIN_MERCHANTS_LIST_PATH}${encodeURIComponent(id)}/`)}?${query}`
    : apiUrl(`${ADMIN_MERCHANTS_LIST_PATH}${encodeURIComponent(id)}/`)

  const res = await fetchWithAuthRecovery(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  const detail = normalizeAdminMerchantProfileResponse(raw)
  if (!detail) {
    throw new Error('Merchant profile response was missing required fields.')
  }
  return detail
}
