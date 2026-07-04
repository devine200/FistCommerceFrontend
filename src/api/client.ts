import { formatDrfValidationDetails } from '@/utils/formatApiValidationDetails'

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

export class ApiRequestError extends Error {
  readonly status: number
  /** Normalized field / serializer messages from `details` when present. */
  readonly detailLines: readonly string[]

  constructor(
    message: string,
    status: number,
    options?: {
      detailLines?: readonly string[]
    },
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.detailLines = options?.detailLines?.length ? [...options.detailLines] : []
  }
}

type ApiErrorJson = {
  message?: string
  error?: string
  errorMessage?: string
  details?: unknown
}

export async function parseApiErrorResponse(res: Response): Promise<ApiRequestError> {
  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    return new ApiRequestError(res.statusText || `Request failed (${res.status})`, res.status)
  }

  const data = (raw && typeof raw === 'object' ? raw : {}) as ApiErrorJson
  const detailLines = formatDrfValidationDetails(data.details)

  const fromFields =
    typeof data.errorMessage === 'string' && data.errorMessage.trim()
      ? data.errorMessage.trim()
      : typeof data.message === 'string' && data.message.trim()
        ? data.message.trim()
        : typeof data.error === 'string' && data.error.trim()
          ? data.error.trim()
          : ''

  const headline =
    fromFields ||
    (detailLines.length ? 'Please correct the issues below.' : '') ||
    res.statusText ||
    `Request failed (${res.status})`

  return new ApiRequestError(headline, res.status, { detailLines })
}

/** Single block of text (e.g. inline alerts) including field errors from `details`. */
export function formatApiRequestErrorPlain(error: ApiRequestError): string {
  if (!error.detailLines.length) return error.message
  return [error.message, ...error.detailLines].filter(Boolean).join('\n')
}

/** User-facing copy for modals and inline alerts; preserves API validation detail lines when present. */
export function toUserFacingError(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    const trimmed = error.trim()
    return trimmed || fallback
  }
  if (error instanceof ApiRequestError) {
    const plain = formatApiRequestErrorPlain(error).trim()
    return plain || fallback
  }
  if (error instanceof Error) {
    const trimmed = error.message.trim()
    return trimmed || fallback
  }
  return fallback
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }
  return (await res.json()) as T
}
