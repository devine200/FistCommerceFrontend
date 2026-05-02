/**
 * DRF API tokens are short; placeholders (`admin-session`, `migrated_session`) stay well under this cap.
 * Reject oversize values to avoid corrupted / multiply-escaped blobs in Redux and `Authorization` headers.
 */
export const MAX_ACCESS_TOKEN_CHARS = 2048

/** Max length for the full `Authorization: Token …` line before sending (browser/proxy limits). */
export const MAX_AUTHORIZATION_HEADER_CHARS = 8192

export function sanitizeAccessToken(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const t = typeof value === 'string' ? value.trim() : ''
  if (!t) return null
  if (t.length > MAX_ACCESS_TOKEN_CHARS) return null
  if (/[\r\n]/.test(t)) return null
  return t
}
