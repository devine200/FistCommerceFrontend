import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseApiErrorResponse, parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import {
  hasDiditVerificationInProgress,
  verificationUrlFromKycPostResponse,
} from '@/api/kycDiditVerification'
import type { KycStatus } from '@/store/slices/kycSlice'

const INVESTOR_KYC_PATH = '/api/kyc/investor'

/**
 * Shape returned by `KYCReviewSerializer` for `AccountVerificationKYC`.
 */
export type InvestorKycRecord = {
  id: string
  user: number | string
  user_type: string
  reviewed: boolean
  kyc_verified: boolean
  insurance_verified: boolean
  /** Didit session URL when verification is in progress. */
  verification_url?: string | null
  didit_session_id?: string | null
  didit_status?: string | null
  document_hash?: string | null
  pending_multisig_proposal_id?: string | null
  created_at: string
}

/**
 * Investor dashboard access: **verified** when `reviewed` and `kyc_verified` (on-chain finalize complete).
 */
export function deriveKycStatusFromInvestorRecord(record: InvestorKycRecord | null | undefined): KycStatus {
  if (!record) return 'not_started'

  const pendingProposal =
    typeof record.pending_multisig_proposal_id === 'string' &&
    record.pending_multisig_proposal_id.trim().length > 0
  if (pendingProposal) return 'pending'

  const { reviewed, kyc_verified } = record
  const inProgress = hasDiditVerificationInProgress(record)

  if (reviewed && kyc_verified) return 'verified'
  if (reviewed && !kyc_verified) return 'rejected'
  if (inProgress || kyc_verified) return 'pending'
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
  const record = raw.kyc_record

  if (!record) {
    throw new Error('Investor KYC response was missing a valid record payload.')
  }
  return record
}

/**
 * Upload identity document and receive a Didit verification URL.
 */
export async function postInvestorKycIdentity(
  accessToken: string,
  file: File,
): Promise<{ verificationUrl: string }> {
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
  return { verificationUrl: verificationUrlFromKycPostResponse(body) }
}
