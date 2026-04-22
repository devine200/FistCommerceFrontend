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

/** `GET/POST` `/api/auth/investor-profile` — `InvestorProfileInfoSerializer` fields. */
export type InvestorProfileInfo = {
  fullname: string
  email: string
  phone_number: string
  country: string
  /** ISO date `YYYY-MM-DD` */
  date_of_birth: string
  /** ISO datetime */
  created_at: string
}

function profileStringField(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

/**
 * Normalize profile JSON so optional / partially-filled serializer rows still match `InvestorProfileInfo`.
 */
function normalizeInvestorProfilePayload(raw: unknown): InvestorProfileInfo | null {
  if (raw === null || raw === undefined) return null
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null
  if (!o) return null
  return {
    fullname: profileStringField(o.fullname),
    email: profileStringField(o.email),
    phone_number: profileStringField(o.phone_number),
    country: profileStringField(o.country),
    date_of_birth: profileStringField(o.date_of_birth),
    created_at: profileStringField(o.created_at),
  }
}

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

/**
 * `GET /api/auth/investor-profile` — current investor’s profile row.
 * Returns `null` when the server responds with 404 (no profile yet).
 */
export async function fetchInvestorProfile(
  accessToken: string | null | undefined,
): Promise<InvestorProfileInfo | null> {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) return null

  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${INVESTOR_PROFILE_PATH}`, {
    method: 'GET',
    headers: tokenAuthHeaders(t),
  })

  
  if (res.status === 404) return null
  const raw = await parseJsonResponse<{message: string; data: InvestorProfileInfo }>(res)
  return normalizeInvestorProfilePayload(raw.data)
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
