import { apiUrl, parseJsonResponse } from '@/api/client'
import { parseAdminWriteResponse, type AdminWriteOutcome } from '@/api/adminActionResponse'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { walletFromUserKey } from '@/utils/walletFromUserKey'

export type KycReviewUserType = 'investor' | 'merchant'

/** Matches `AdminKYCReview.status` enum on the backend. */
export type KycReviewStatus = 'UnderReview' | 'Verified' | 'Rejected' | 'Revoked'

export type KycReviewListRow = {
  /** KYC record UUID — sent as `kyc_id` on review POST. */
  id: string
  userId: number
  userType: KycReviewUserType
  reviewed: boolean
  kycVerified: boolean
  insuranceVerified: boolean
  createdAt: string
}

export type AdminKycRecordDetail = KycReviewListRow & {
  username: string
  documentHash: string | null
  adminStatus: string | null
  verificationUrl: string | null
  diditSessionId: string | null
  diditStatus: string | null
  pendingMultisigProposalId: string | null
}

const KYC_REVIEW_PATH = '/kyc/admin/kyc-review'
const KYC_VERIFY_PATH = '/kyc/admin/kyc-verify'
const KYC_DUMMY_VERIFY_PATH = '/kyc/admin/kyc-dummy-verify'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for admin KYC review request.')
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

function normalizeUserType(raw: string): KycReviewUserType {
  return raw.trim().toLowerCase() === 'merchant' ? 'merchant' : 'investor'
}

function normalizeKycReviewRow(raw: unknown): KycReviewListRow | null {
  const r = asRecord(raw)
  const id = pickStr(r, 'id', 'kyc_id', 'kycId')
  const userId = pickNumber(r, 'user', 'user_id', 'userId')
  if (!id || userId == null) return null
  return {
    id,
    userId,
    userType: normalizeUserType(pickStr(r, 'userType', 'user_type')),
    reviewed: pickBool(r, 'reviewed'),
    kycVerified: pickBool(r, 'kyc_verified', 'kycVerified'),
    insuranceVerified: pickBool(r, 'insurance_verified', 'insuranceVerified'),
    createdAt: pickStr(r, 'createdAt', 'created_at'),
  }
}

function pickNullableStr(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (v === null) return null
  }
  return null
}

function normalizeKycRecordDetail(raw: unknown): AdminKycRecordDetail | null {
  const base = normalizeKycReviewRow(raw)
  if (!base) return null
  const r = asRecord(raw)
  // Detail serializer may still expose composite `wallet:chainId` as `username`.
  const usernameRaw = pickStr(r, 'username')
  return {
    ...base,
    username: walletFromUserKey(usernameRaw),
    documentHash: pickNullableStr(r, 'document_hash', 'documentHash'),
    adminStatus: pickNullableStr(r, 'admin_status', 'adminStatus'),
    verificationUrl: pickNullableStr(r, 'verification_url', 'verificationUrl'),
    diditSessionId: pickNullableStr(r, 'didit_session_id', 'diditSessionId'),
    diditStatus: pickNullableStr(r, 'didit_status', 'diditStatus'),
    pendingMultisigProposalId: pickNullableStr(
      r,
      'pending_multisig_proposal_id',
      'pendingMultisigProposalId',
    ),
  }
}

function flattenKycReviewListResponse(raw: unknown): KycReviewListRow[] {
  const r = asRecord(raw)
  const rows: KycReviewListRow[] = []
  const seen = new Set<string>()
  const buckets = [r.verified_kyc_records, r.unverified_kyc_records, r.results]
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue
    for (const item of bucket) {
      const row = normalizeKycReviewRow(item)
      if (row && !seen.has(row.id)) {
        seen.add(row.id)
        rows.push(row)
      }
    }
  }
  if (rows.length === 0 && Array.isArray(raw)) {
    for (const item of raw) {
      const row = normalizeKycReviewRow(item)
      if (row && !seen.has(row.id)) {
        seen.add(row.id)
        rows.push(row)
      }
    }
  }
  return rows
}

/** `GET /api/kyc/admin/kyc-review` */
export async function fetchAdminKycReviewList(
  accessToken: string | null | undefined,
): Promise<KycReviewListRow[]> {
  const res = await fetchWithAuthRecovery(apiUrl(`${KYC_REVIEW_PATH}`), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return flattenKycReviewListResponse(raw)
}

/** `GET /api/kyc/admin/kyc-review/<kycId>/` — KYC row matching profile `kycId`. */
export async function fetchAdminKycRecordById(
  accessToken: string | null | undefined,
  kycId: string,
  options?: { signal?: AbortSignal },
): Promise<AdminKycRecordDetail> {
  const id = kycId.trim()
  if (!id) throw new Error('Missing KYC record id.')

  const res = await fetchWithAuthRecovery(apiUrl(`${KYC_REVIEW_PATH}/${encodeURIComponent(id)}/`), {
    method: 'GET',
    headers: authHeaders(accessToken),
    signal: options?.signal,
  })
  const raw = await parseJsonResponse<unknown>(res)
  const record = normalizeKycRecordDetail(asRecord(raw).kyc_record)
  if (!record) {
    throw new Error('KYC record response was missing a valid record payload.')
  }
  return record
}

/**
 * Load the KYC record tied to an admin profile: prefer explicit `kycId`, then wallet lookup.
 */
export async function fetchAdminKycRecordForProfile(
  accessToken: string | null | undefined,
  options: {
    kycId?: string | null
    wallet?: string | null
    userType: KycReviewUserType
    signal?: AbortSignal
  },
): Promise<AdminKycRecordDetail> {
  const kycId = options.kycId?.trim()
  if (kycId) {
    return fetchAdminKycRecordById(accessToken, kycId, { signal: options.signal })
  }

  const wallet = options.wallet?.trim()
  if (wallet) {
    return fetchAdminKycRecordByUsername(accessToken, wallet, options.userType, {
      signal: options.signal,
    })
  }

  throw new Error('Missing KYC record id or wallet for profile lookup.')
}

/** `GET /api/kyc/admin/kyc-review/user/<wallet>/` — latest KYC row for a wallet username. */
export async function fetchAdminKycRecordByUsername(
  accessToken: string | null | undefined,
  wallet: string,
  userType: KycReviewUserType,
  options?: { signal?: AbortSignal },
): Promise<AdminKycRecordDetail> {
  const username = wallet.trim()
  if (!username) throw new Error('Missing wallet address for KYC lookup.')

  const params = new URLSearchParams({ user_type: userType })
  const res = await fetchWithAuthRecovery(
    apiUrl(`${KYC_REVIEW_PATH}/user/${encodeURIComponent(username)}/?${params}`),
    {
      method: 'GET',
      headers: authHeaders(accessToken),
      signal: options?.signal,
    },
  )
  const raw = await parseJsonResponse<unknown>(res)
  const record = normalizeKycRecordDetail(asRecord(raw).kyc_record)
  if (!record) {
    throw new Error('KYC record response was missing a valid record payload.')
  }
  return record
}

export type PostKycReviewParams = {
  kycId: string
  status: KycReviewStatus
}

/** `POST /api/kyc/admin/kyc-review` */
export async function postAdminKycReview(
  accessToken: string | null | undefined,
  params: PostKycReviewParams,
  options?: { signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const kycId = params.kycId.trim()
  if (!kycId) throw new Error('Missing KYC record id.')

  const res = await fetchWithAuthRecovery(apiUrl(`${KYC_REVIEW_PATH}`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      kyc_id: kycId,
      status: params.status,
    }),
    signal: options?.signal,
  })
  return parseAdminWriteResponse(res)
}

/** Resolve `kyc_id` from profile field, per-user lookup, or admin KYC list fallback. */
export async function resolveAdminKycId(
  accessToken: string | null | undefined,
  options: {
    kycId?: string | null
    wallet?: string | null
    userId: number
    userType: KycReviewUserType
    signal?: AbortSignal
  },
): Promise<string> {
  const direct = options.kycId?.trim()
  if (direct) return direct

  const wallet = options.wallet?.trim()
  if (wallet) {
    try {
      const record = await fetchAdminKycRecordByUsername(
        accessToken,
        wallet,
        options.userType,
        { signal: options.signal },
      )
      if (record.id) return record.id
    } catch {
      /* fall through to list lookup */
    }
  }

  const rows = await fetchAdminKycReviewList(accessToken)
  const match = rows.find(
    (row) => row.userId === options.userId && row.userType === options.userType,
  )
  if (match?.id) return match.id

  throw new Error('Could not find KYC record id for this user. Refresh the profile and try again.')
}

/** `POST /api/kyc/admin/kyc-verify` — merchant insurance + KYB audit flags before on-chain finalize */
export async function postAdminKycVerify(
  accessToken: string | null | undefined,
  params: {
    kycId: string
    insuranceVerified: boolean
    kycVerified: boolean
  },
  options?: { signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const kycId = params.kycId.trim()
  if (!kycId) throw new Error('Missing KYC record id.')

  const res = await fetchWithAuthRecovery(apiUrl(`${KYC_VERIFY_PATH}`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      kyc_id: kycId,
      insurance_verified: params.insuranceVerified,
      kyc_verified: params.kycVerified,
    }),
    signal: options?.signal,
  })
  return parseAdminWriteResponse(res)
}

/**
 * `POST /api/kyc/admin/kyc-dummy-verify` — bypass Didit for dev/QA: mints the
 * verification NFT, creates the on-chain compliance record, and forces the KYC
 * record to Verified. Identifies the user by wallet + type (no kyc_id needed;
 * the record is created if missing).
 */
export async function postAdminKycDummyVerify(
  accessToken: string | null | undefined,
  params: { username: string; userType: KycReviewUserType },
  options?: { signal?: AbortSignal },
): Promise<AdminWriteOutcome> {
  const username = params.username.trim()
  if (!username) throw new Error('Missing wallet address.')

  const res = await fetchWithAuthRecovery(apiUrl(`${KYC_DUMMY_VERIFY_PATH}`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      username,
      user_type: params.userType,
    }),
    signal: options?.signal,
  })
  return parseAdminWriteResponse(res)
}
