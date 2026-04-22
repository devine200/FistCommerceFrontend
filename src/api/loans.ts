import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'

/**
 * Swagger: `GET /loan/request` → `{ loans: [{ id, user, loan_amount, risk_tier_id, verification_doc_hash, status, created_at }] }`
 */

export type MerchantLoanApi = {
  id: string
  user?: number
  loan_amount: string
  risk_tier_id?: number
  verification_doc_hash?: string
  status: string
  created_at: string
}

export type MerchantLoansResponse = {
  loans: MerchantLoanApi[]
}

function requireAccessToken(accessToken: string | null | undefined): string {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for authorized request.')
  return t
}

function tokenAuthValue(accessToken: string): string {
  const t = accessToken.trim()
  return /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const token = requireAccessToken(accessToken)
  return {
    Accept: 'application/json',
    Authorization: tokenAuthValue(token),
  }
}

export async function fetchMerchantLoans(
  accessToken: string | null | undefined,
): Promise<MerchantLoanApi[]> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}/api/loan/request`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const data = await parseJsonResponse<MerchantLoansResponse>(res)
  return Array.isArray(data.loans) ? data.loans : []
}

