import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'
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
  created_at: string
}

/**
 * Maps serializer booleans to UI status:
 * - **verified** — both `kyc_verified` and `insurance_verified`
 * - **rejected** — staff `reviewed` but not both verified
 * - **pending** — at least one verification flag set, still in progress
 * - **not_started** — no record or no progress yet
 */
export function deriveKycStatusFromInvestorRecord(record: InvestorKycRecord | null | undefined): KycStatus {
  if (!record) return 'not_started'

  const { reviewed, kyc_verified, insurance_verified } = record

  if (kyc_verified && insurance_verified) return 'verified'
  if (reviewed && !(kyc_verified && insurance_verified)) return 'rejected'
  if (kyc_verified || insurance_verified) return 'pending'
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
