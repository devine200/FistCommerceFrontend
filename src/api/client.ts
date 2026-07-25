import { toAppUserFacingError } from '@/errors/toAppUserFacingError'
import { parseApiErrorResponse } from '@/api/apiRequestError'

export {
  ApiRequestError,
  formatApiRequestErrorPlain,
  parseApiErrorResponse,
} from '@/api/apiRequestError'

/** Backend base from Vite env (no trailing slash). May be origin (`http://host:8000`) or API root (`…/api`). */
export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/+$/, '')
}

export function requireApiBaseUrl(): string {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error(
      'Missing VITE_API_BASE_URL. Add it to your .env file (see .env.example) and restart the dev server.',
    )
  }
  return base
}

/** Normalized Django API root, always ending with `/api`. */
export function getApiRoot(): string {
  const base = requireApiBaseUrl()
  return base.endsWith('/api') ? base : `${base}/api`
}

/** Build a full URL from an OpenAPI path (e.g. `/kyc/admin/merchants/` → `…/api/kyc/admin/merchants/`). */
export function apiUrl(path: string): string {
  const segment = path.startsWith('/') ? path : `/${path}`
  return `${getApiRoot()}${segment}`
}

/** User-facing copy for modals and inline alerts; maps technical errors via the shared catalogue. */
export function toUserFacingError(error: unknown, fallback: string): string {
  return toAppUserFacingError(error, fallback)
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }
  return (await res.json()) as T
}
