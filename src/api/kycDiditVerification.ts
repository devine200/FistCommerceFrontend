import { ApiRequestError } from '@/api/client'

/**
 * Backend may return the Didit verification URL under any of these keys until the contract is finalized.
 */
export type KycDiditPostResponse = {
  verification_url?: string | null
  session_id?: string | null
  kyc_record?: { verification_url?: string | null; didit_session_id?: string | null } | null
}

export function verificationUrlFromKycPostResponse(body: unknown): string {
  if (!body || typeof body !== 'object') {
    throw new ApiRequestError('Invalid KYC response.', 502)
  }
  const b = body as KycDiditPostResponse
  const url =
    (typeof b.verification_url === 'string' ? b.verification_url.trim() : '') ||
    (typeof b.kyc_record?.verification_url === 'string' ? b.kyc_record.verification_url.trim() : '')
  if (!url) {
    throw new ApiRequestError('Missing Didit verification URL in response.', 502)
  }
  return url
}

export type KycIdentityApprovalRecord = {
  kyc_verified?: boolean
  reviewed?: boolean
  pending_multisig_proposal_id?: string | null
}

export function hasDiditVerificationInProgress(
  record:
    | {
        verification_url?: string | null
        didit_session_id?: string | null
        didit_status?: string | null
      }
    | null
    | undefined,
): boolean {
  if (!record) return false
  const status = typeof record.didit_status === 'string' ? record.didit_status.trim() : ''
  if (status === 'In Review') return true
  const url = typeof record.verification_url === 'string' && record.verification_url.trim().length > 0
  const session =
    typeof record.didit_session_id === 'string' && record.didit_session_id.trim().length > 0
  return url || session
}

/** Didit identity passed (`kyc_verified`) but dashboard access is not finalized on-chain yet. */
export function isKycIdentityAwaitingOnChainApproval(
  record: KycIdentityApprovalRecord | null | undefined,
): boolean {
  if (!record) return false
  const pendingProposal =
    typeof record.pending_multisig_proposal_id === 'string' &&
    record.pending_multisig_proposal_id.trim().length > 0
  if (pendingProposal) return true
  if (!record.kyc_verified) return false
  return !(record.reviewed && record.kyc_verified)
}
