import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseApiErrorResponse, parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import {
  hasDiditVerificationInProgress,
  verificationUrlFromKycPostResponse,
} from '@/api/kycDiditVerification'
import type { KycStatus } from '@/store/slices/kycSlice'

const MERCHANT_KYC_PATH = '/api/kyc/merchant'

export type MerchantKycRecord = {
  id: string
  user: number | string
  user_type: string
  reviewed: boolean
  kyc_verified: boolean
  insurance_verified: boolean
  verification_url?: string | null
  didit_session_id?: string | null
  didit_status?: string | null
  document_hash?: string | null
  pending_multisig_proposal_id?: string | null
  created_at: string
}

/**
 * Merchant dashboard access: **verified** only when both `kyc_verified` and `insurance_verified`.
 */
export function deriveKycStatusFromMerchantRecord(record: MerchantKycRecord | null | undefined): KycStatus {
  if (!record) return 'not_started'

  const pendingProposal =
    typeof record.pending_multisig_proposal_id === 'string' &&
    record.pending_multisig_proposal_id.trim().length > 0
  if (pendingProposal) return 'pending'

  const { reviewed, kyc_verified, insurance_verified } = record
  const inProgress = hasDiditVerificationInProgress(record)

  if (reviewed && kyc_verified && insurance_verified) return 'verified'
  if (reviewed && !(kyc_verified && insurance_verified)) return 'rejected'
  if (inProgress || kyc_verified || insurance_verified) return 'pending'
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

async function postMerchantKycDocuments(
  accessToken: string,
  form: FormData,
): Promise<{ verificationUrl: string }> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${MERCHANT_KYC_PATH}`, {
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

export async function postMerchantKycIdentity(
  accessToken: string,
  file: File,
): Promise<{ verificationUrl: string }> {
  const form = new FormData()
  form.append('document', file)
  return postMerchantKycDocuments(accessToken, form)
}

export async function postMerchantKycInsurance(
  accessToken: string,
  file: File,
): Promise<{ verificationUrl: string }> {
  const form = new FormData()
  form.append('document', file)
  return postMerchantKycDocuments(accessToken, form)
}
