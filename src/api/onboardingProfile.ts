import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'

/**
 * DRF `TokenAuthentication`: send `Authorization: Token <access_token>` (see backend ReDoc).
 * Paths are relative to `VITE_API_BASE_URL` (must include `/api`, e.g. `http://127.0.0.1:8000/api`).
 *
 * Request bodies match `InvestorProfileInfoUpdateRequestSerializer` and
 * `MerchantProfileInfoUpdateRequestSerializer` in the authenticator app.
 */

const INVESTOR_PROFILE_PATH = '/api/auth/investor-profile'
const MERCHANT_PROFILE_PATH = '/api/auth/merchant-profile'

function tokenAuthHeaders(accessToken: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Token ${accessToken.trim()}`,
  }
}

/** POST /auth/investor-profile — `InvestorProfileInfoUpdateRequestSerializer` */
export type InvestorProfileCreateBody = {
  first_name: string
  email: string
  phone_number: string
  country: string
  /** ISO date `YYYY-MM-DD` */
  date_of_birth: string
}

/** POST /auth/merchant-profile — `MerchantProfileInfoUpdateRequestSerializer` */
export type MerchantProfileCreateBody = {
  fullname: string
  email: string
  phone_number: string
  business_name: string
  business_address: string
  business_country: string
  business_year_of_operation: number
  business_industry: string
  business_website?: string
}

export async function postInvestorProfile(
  accessToken: string,
  body: InvestorProfileCreateBody,
): Promise<void> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${INVESTOR_PROFILE_PATH}`, {
    method: 'POST',
    headers: tokenAuthHeaders(accessToken),
    body: JSON.stringify(body),
  })
  if (res.status === 201) return
  await parseJsonResponse<unknown>(res)
}

export async function postMerchantProfile(
  accessToken: string,
  body: MerchantProfileCreateBody,
): Promise<void> {
  const base = requireApiBaseUrl()
  const payload: Record<string, unknown> = { ...body }
  if (!body.business_website?.trim()) {
    delete payload.business_website
  }
  const res = await fetchWithAuthRecovery(`${base}${MERCHANT_PROFILE_PATH}`, {
    method: 'POST',
    headers: tokenAuthHeaders(accessToken),
    body: JSON.stringify(payload),
  })
  if (res.status === 201) return
  await parseJsonResponse<unknown>(res)
}
