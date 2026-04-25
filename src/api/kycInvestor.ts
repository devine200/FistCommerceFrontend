import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseApiErrorResponse, parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import { sumsubTokenFromKycPostResponse } from '@/api/kycSumsubTokens'
import type { KycStatus } from '@/store/slices/kycSlice'

const INVESTOR_KYC_PATH = '/api/kyc/investor'

/**
 * Shape returned by `KYCReviewSerializer` for `AccountVerificationKYC`.
 * (`document_hash` exists on the model but is not exposed by this serializer.)
 */
export type InvestorKycRecord = {
  id: string
  /** FK to User — typically the primary key from DRF. */
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
 * Investor dashboard access: **verified** when `kyc_verified` only (`insurance_verified` ignored).
 * - **rejected** — `reviewed` and identity not verified
 * - **pending** — non-empty `kyc_token`, or identity not yet verified after partial progress
 * - **not_started** — no token and identity not verified
 */
export function deriveKycStatusFromInvestorRecord(record: InvestorKycRecord | null | undefined): KycStatus {
  if (!record) return 'not_started'

  const { reviewed, kyc_verified } = record
  const token = typeof record.kyc_token === 'string' && record.kyc_token.trim().length > 0

  if (kyc_verified) return 'verified'
  if (reviewed && !kyc_verified) return 'rejected'
  if (token) return 'pending'
  return 'not_started'
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for investor KYC request.')
  return {
    Accept: 'application/json',
    Authorization: `Token ${t}`,
  }
}

function authHeadersMultipart(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for investor KYC request.')
  return {
    Authorization: `Token ${t}`,
  }
}

export async function fetchInvestorKycRecord(accessToken: string | null | undefined): Promise<InvestorKycRecord> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${INVESTOR_KYC_PATH}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<{ message: string; kyc_record: InvestorKycRecord }>(res)
  const record = raw.kyc_record;

  if (!record) {
    throw new Error('Investor KYC response was missing a valid `id` or was not a JSON object.')
  }
  return record
}

/**
 * Upload identity document and receive a Sumsub WebSDK access token.
 * POSTs to the same path as GET (`/api/kyc/investor`). Multipart file field: `document`.
 */
export async function postInvestorKycIdentityForSumsub(
  accessToken: string,
  file: File,
): Promise<{ sumsubAccessToken: string }> {
  const base = requireApiBaseUrl()
  const form = new FormData()
  form.append('document', file)
  const res = await fetchWithAuthRecovery(`${base}${INVESTOR_KYC_PATH}`, {
    method: 'POST',
    headers: authHeadersMultipart(accessToken),
    body: form,
  })
  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }
  const body: unknown = await res.json()
  return { sumsubAccessToken: sumsubTokenFromKycPostResponse(body) }
}
