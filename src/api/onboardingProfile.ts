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

/** `GET/POST` `/api/auth/merchant-profile` — merchant profile serializer fields (best-effort; API may omit some). */
export type MerchantProfileInfo = {
  fullname: string
  email: string
  phone_number: string
  business_name: string
  business_address: string
  business_country: string
  business_year_of_operation: string
  business_industry: string
  business_website: string
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

function normalizeMerchantProfilePayload(raw: unknown): MerchantProfileInfo | null {
  if (raw === null || raw === undefined) return null
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null
  if (!o) return null
  return {
    fullname: profileStringField(o.fullname),
    email: profileStringField(o.email),
    phone_number: profileStringField(o.phone_number),
    business_name: profileStringField(o.business_name),
    business_address: profileStringField(o.business_address),
    business_country: profileStringField(o.business_country),
    business_year_of_operation: profileStringField(o.business_year_of_operation),
    business_industry: profileStringField(o.business_industry),
    business_website: profileStringField(o.business_website),
    created_at: profileStringField(o.created_at),
  }
}

function unwrapProfileEnvelope(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw
  const rec = raw as Record<string, unknown>
  if ('data' in rec) return rec.data
  return raw
}

function tokenAuthHeaders(accessToken: string): HeadersInit {
  const t = accessToken.trim()
  const authValue = /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: authValue,
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
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeInvestorProfilePayload(unwrapProfileEnvelope(raw))
}

/**
 * `GET /api/auth/merchant-profile` — current merchant’s profile row.
 * Returns `null` when the server responds with 404 (no profile yet).
 */
export async function fetchMerchantProfile(
  accessToken: string | null | undefined,
): Promise<MerchantProfileInfo | null> {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) return null

  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${MERCHANT_PROFILE_PATH}`, {
    method: 'GET',
    headers: tokenAuthHeaders(t),
  })

  if (res.status === 404) return null
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeMerchantProfilePayload(unwrapProfileEnvelope(raw))
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
