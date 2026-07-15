/**
 * DRF API tokens are short; placeholders (`admin-session`, `migrated_session`) stay well under this cap.
 * Reject oversize values to avoid corrupted / multiply-escaped blobs in Redux and `Authorization` headers.
 */
export const MAX_ACCESS_TOKEN_CHARS = 2048

/** Max length for the full `Authorization: Token …` line before sending (browser/proxy limits). */
export const MAX_AUTHORIZATION_HEADER_CHARS = 8192

/** Placeholder / local-only values that must never be sent as `Authorization: Token …`. */
const NON_API_ACCESS_TOKENS = new Set(['admin-session', 'migrated_session'])

export function sanitizeAccessToken(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const t = typeof value === 'string' ? value.trim() : ''
  if (!t) return null
  if (t.length > MAX_ACCESS_TOKEN_CHARS) return null
  if (/[\r\n]/.test(t)) return null
  return t
}

/** True when the value is a real backend access token (not empty, local, or migration placeholders). */
export function isUsableApiAccessToken(value: string | null | undefined): boolean {
  const t = sanitizeAccessToken(value)
  if (!t) return false
  if (NON_API_ACCESS_TOKENS.has(t)) return false
  if (t.startsWith('local_')) return false
  return true
}

/** Refresh tokens may be longer than access keys; still cap to avoid corrupt persisted blobs. */
export const MAX_REFRESH_TOKEN_CHARS = 4096

export function sanitizeRefreshToken(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const t = typeof value === 'string' ? value.trim() : ''
  if (!t) return null
  if (t.length > MAX_REFRESH_TOKEN_CHARS) return null
  if (/[\r\n]/.test(t)) return null
  return t
}
