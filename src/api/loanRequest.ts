import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'

export type LoanRequestCreateResponse = {
  message: string
}

function tokenAuthHeaderValue(accessToken: string): string {
  const t = accessToken.trim()
  return /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
}

/**
 * `POST /api/loan/request`
 * Swagger: multipart form-data fields:
 * - `loan_amount` (number)
 * - `risk_tier_id` (integer)
 * - `document` (file)
 */
export async function postMerchantLoanRequest(
  accessToken: string,
  formData: FormData,
): Promise<LoanRequestCreateResponse> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}/api/loan/request`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: tokenAuthHeaderValue(accessToken),
      // Do NOT set Content-Type; browser will set multipart boundary.
    },
    body: formData,
  })
  return await parseJsonResponse<LoanRequestCreateResponse>(res)
}

