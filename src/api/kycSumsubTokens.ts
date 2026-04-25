import { ApiRequestError } from '@/api/client'

/**
 * Backend may return the Sumsub applicant token under any of these keys until the contract is finalized.
 * Adjust `coerceSumsubAccessToken` when the API stabilizes.
 */
export type SumsubTokenJson = {
  kyc_token?: string
}

/**
 * Backend responses have varied between:
 * - `{ kyc_token: string }`
 * - `{ kyc_record: { kyc_token: string } }`
 *
 * This helper normalizes both shapes.
 */
export type KycPostForSumsubResponse = {
  kyc_token?: string | null
  kyc_record?: { kyc_token?: string | null } | null
}

export function sumsubTokenFromKycPostResponse(body: unknown): string {
  if (!body || typeof body !== 'object') {
    throw new ApiRequestError('Invalid response from KYC upload.', 502)
  }
  const b = body as KycPostForSumsubResponse
  const raw =
    (typeof b.kyc_token === 'string' ? b.kyc_token.trim() : '') ||
    (typeof b.kyc_record?.kyc_token === 'string' ? b.kyc_record.kyc_token.trim() : '')
  if (!raw) {
    throw new ApiRequestError('Missing Sumsub access token in response.', 502)
  }
  return raw
}
