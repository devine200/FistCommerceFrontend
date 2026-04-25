import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseApiErrorResponse, parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import { sumsubTokenFromKycPostResponse } from '@/api/kycSumsubTokens'
import type { KycStatus } from '@/store/slices/kycSlice'

const MERCHANT_KYC_PATH = '/api/kyc/merchant'

/**
 * Shape returned by `KYCReviewSerializer` for `AccountVerificationKYC`.
 * Merchant payload is expected to mirror investor shape.
 */
export type MerchantKycRecord = {
  id: string
  user: number | string
  user_type: string
  reviewed: boolean
  kyc_verified: boolean
  insurance_verified: boolean
  /** When non-empty, user has started Sumsub-backed KYC (in progress on dashboard). */
  kyc_token?: string | null
  /** Present when a document has been uploaded (server-side hash). */
  document_hash?: string | null
  created_at: string
}

/**
 * Merchant dashboard access: **verified** only when both `kyc_verified` and `insurance_verified`.
 */
export function deriveKycStatusFromMerchantRecord(record: MerchantKycRecord | null | undefined): KycStatus {
  if (!record) return 'not_started'

  const { reviewed, kyc_verified, insurance_verified } = record
  const token = typeof record.kyc_token === 'string' && record.kyc_token.trim().length > 0

  if (reviewed && kyc_verified && insurance_verified) return 'verified'
  if (reviewed && !(kyc_verified && insurance_verified)) return 'rejected'
  if (token || kyc_verified || insurance_verified) return 'pending'
  return 'not_started'
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for merchant KYC request.')
  return {
    Accept: 'application/json',
    Authorization: `Token ${t}`,
  }
}

function authHeadersMultipart(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for merchant KYC request.')
  return {
    Authorization: `Token ${t}`,
  }
}

export async function fetchMerchantKycRecord(accessToken: string | null | undefined): Promise<MerchantKycRecord> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${MERCHANT_KYC_PATH}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<{ message: string; kyc_record: MerchantKycRecord }>(res)
  const record = raw.kyc_record

  if (!record) {
    throw new Error('Merchant KYC response was missing a valid record payload.')
  }
  return record
}


type KycIdentityResponse = {
  kyc_token: string;
}

/** Multipart POST to same path as GET (`/api/kyc/merchant`); response shape matches investor (`kyc_record.kyc_token`). */
async function postMerchantKycDocumentsForSumsub(
  accessToken: string,
  form: FormData,
): Promise<{ sumsubAccessToken: string }> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${MERCHANT_KYC_PATH}`, {
    method: 'POST',
    headers: authHeadersMultipart(accessToken),
    body: form,
  })
  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }
  const body: KycIdentityResponse = await res.json()
  console.log({body})
  return { sumsubAccessToken: sumsubTokenFromKycPostResponse(body) }
}

/**
 * Merchant identity — same request shape as investor: multipart field `document` only.
 */
export async function postMerchantKycIdentityForSumsub(
  accessToken: string,
  file: File,
): Promise<{ sumsubAccessToken: string }> {
  const form = new FormData()
  form.append('document', file)
  return postMerchantKycDocumentsForSumsub(accessToken, form)
}

/**
 * Merchant insurance — same request shape as investor (`document` only); backend distinguishes leg by account state.
 */
export async function postMerchantKycInsuranceForSumsub(
  accessToken: string,
  file: File,
): Promise<{ sumsubAccessToken: string }> {
  const form = new FormData()
  form.append('document', file)
  return postMerchantKycDocumentsForSumsub(accessToken, form)
}

