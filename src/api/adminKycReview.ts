import { apiUrl, parseJsonResponse } from '@/api/client'
import { parseAdminWriteResponse, type AdminWriteOutcome } from '@/api/adminActionResponse'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

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

const KYC_REVIEW_PATH = '/kyc/admin/kyc-review'
const KYC_VERIFY_PATH = '/kyc/admin/kyc-verify'

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

function flattenKycReviewListResponse(raw: unknown): KycReviewListRow[] {
  const r = asRecord(raw)
  const rows: KycReviewListRow[] = []
  const buckets = [
    r.verified_kyc_records,
    r.unverified_kyc_records,
    r.results,
    raw,
  ]
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue
    for (const item of bucket) {
      const row = normalizeKycReviewRow(item)
      if (row) rows.push(row)
    }
    if (rows.length > 0 && bucket !== raw) break
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

/** Resolve `kyc_id` from profile field or admin KYC list (`user` + `user_type`). */
export async function resolveAdminKycId(
  accessToken: string | null | undefined,
  options: {
    kycId?: string | null
    userId: number
    userType: KycReviewUserType
  },
): Promise<string> {
  const direct = options.kycId?.trim()
  if (direct) return direct

  const rows = await fetchAdminKycReviewList(accessToken)
  const match = rows.find(
    (row) => row.userId === options.userId && row.userType === options.userType,
  )
  if (match?.id) return match.id

  throw new Error('Could not find KYC record id for this user. Refresh the profile and try again.')
}

/** `POST /api/kyc/admin/kyc-verify` — merchant insurance flags pre-review */
export async function postAdminKycVerify(
  accessToken: string | null | undefined,
  params: { wallet: string },
): Promise<AdminWriteOutcome> {
  const res = await fetchWithAuthRecovery(apiUrl(`${KYC_VERIFY_PATH}`), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({ wallet: params.wallet.trim() }),
  })
  return parseAdminWriteResponse(res)
}
