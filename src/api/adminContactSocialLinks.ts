import { apiUrl, parseJsonResponse } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'

export type AdminContactSocialLinks = {
  email: string
  telegram: string
  linkedin: string
  instagram: string
  facebook: string
}

export type AdminContactSocialLinksResponse = AdminContactSocialLinks & {
  updatedAt: string | null
}

const ADMIN_CONTACT_SOCIAL_LINKS_PATH = '/config/admin/contact-social-links/'
const PUBLIC_CONTACT_PATH = '/config/contact/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for admin contact settings API request.')
  const header = /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
  return {
    Accept: 'application/json',
    Authorization: header,
  }
}

function jsonAuthHeaders(accessToken: string | null | undefined): HeadersInit {
  return {
    ...authHeaders(accessToken),
    'Content-Type': 'application/json',
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function pickStr(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'string') return v.trim()
  }
  return ''
}

function pickNullableStr(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key]
    if (v === null) return null
    if (typeof v === 'string') return v.trim() || null
  }
  return null
}

function normalizeContactSocialLinks(raw: unknown): AdminContactSocialLinks {
  const r = asRecord(raw)
  return {
    email: pickStr(r, 'email'),
    telegram: pickStr(r, 'telegram'),
    linkedin: pickStr(r, 'linkedin'),
    instagram: pickStr(r, 'instagram'),
    facebook: pickStr(r, 'facebook'),
  }
}

function normalizeContactSocialLinksResponse(raw: unknown): AdminContactSocialLinksResponse {
  const r = asRecord(raw)
  return {
    ...normalizeContactSocialLinks(r),
    updatedAt: pickNullableStr(r, 'updatedAt', 'updated_at'),
  }
}

/** `GET /api/config/admin/contact-social-links/` — load admin contact & social settings. */
export async function fetchAdminContactSocialLinks(
  accessToken: string | null | undefined,
): Promise<AdminContactSocialLinksResponse> {
  const res = await fetchWithAuthRecovery(apiUrl(ADMIN_CONTACT_SOCIAL_LINKS_PATH), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeContactSocialLinksResponse(raw)
}

/** `POST /api/config/admin/contact-social-links/` — save admin contact & social settings. */
export async function postAdminContactSocialLinks(
  accessToken: string | null | undefined,
  payload: AdminContactSocialLinks,
): Promise<AdminContactSocialLinksResponse> {
  const res = await fetchWithAuthRecovery(apiUrl(ADMIN_CONTACT_SOCIAL_LINKS_PATH), {
    method: 'POST',
    headers: jsonAuthHeaders(accessToken),
    body: JSON.stringify({
      email: payload.email.trim(),
      telegram: payload.telegram.trim(),
      linkedin: payload.linkedin.trim(),
      instagram: payload.instagram.trim(),
      facebook: payload.facebook.trim(),
    }),
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeContactSocialLinksResponse(raw)
}

/** `GET /api/config/contact/` — public contact & social links (no auth). */
export async function fetchPublicContactSocialLinks(): Promise<AdminContactSocialLinks> {
  const res = await fetchWithAuthRecovery(apiUrl(PUBLIC_CONTACT_PATH), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  const raw = await parseJsonResponse<unknown>(res)
  return normalizeContactSocialLinks(raw)
}
