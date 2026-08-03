import { formatDrfValidationDetails } from '@/utils/formatApiValidationDetails'

export class ApiRequestError extends Error {
  readonly status: number
  /** Normalized field / serializer messages from `details` when present. */
  readonly detailLines: readonly string[]
  /** Stable API error code from JSON `code` when present. */
  readonly apiCode?: string

  constructor(
    message: string,
    status: number,
    options?: {
      detailLines?: readonly string[]
      apiCode?: string
    },
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.detailLines = options?.detailLines?.length ? [...options.detailLines] : []
    this.apiCode = options?.apiCode?.trim() || undefined
  }
}

function pickTrimmedString(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

/** DRF often returns `detail` as a string or list of strings. */
function pickDetailHeadline(raw: Record<string, unknown>): string {
  const detail = raw.detail
  if (typeof detail === 'string' && detail.trim()) return detail.trim()
  if (Array.isArray(detail)) {
    const parts = detail
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map((v) => v.trim())
    if (parts.length) return parts.join(' ')
  }
  return ''
}

/**
 * Build an {@link ApiRequestError} from an already-parsed JSON body.
 * Prefer this when the response body has already been consumed (e.g. admin writes).
 */
export function apiRequestErrorFromJson(
  status: number,
  raw: unknown,
  statusTextFallback = '',
): ApiRequestError {
  const data =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  const detailLines = formatDrfValidationDetails(data.details ?? data.non_field_errors)

  // If `details` is absent but the body itself is a DRF field-error map, flatten it.
  const bodyAsDetails =
    detailLines.length === 0 &&
    !pickTrimmedString(data.message) &&
    !pickTrimmedString(data.error) &&
    !pickTrimmedString(data.errorMessage) &&
    !pickDetailHeadline(data) &&
    Object.keys(data).length > 0
      ? formatDrfValidationDetails(data)
      : []

  const lines = detailLines.length ? detailLines : bodyAsDetails

  const apiCode = pickTrimmedString(data.code)

  const fromFields =
    pickTrimmedString(data.errorMessage) ||
    pickTrimmedString(data.message) ||
    pickTrimmedString(data.error) ||
    pickDetailHeadline(data)

  const headline =
    fromFields ||
    (lines.length ? 'Please correct the issues below.' : '') ||
    statusTextFallback.trim() ||
    (status >= 400 ? `Request failed (${status})` : 'Request failed.')

  // Avoid showing bare HTTP status text when we have nothing better — classify will map it.
  const normalizedHeadline =
    /^(bad request|unauthorized|forbidden|not found)$/i.test(headline) && !fromFields && !lines.length
      ? `Request failed (${status})`
      : headline

  return new ApiRequestError(normalizedHeadline, status, { detailLines: lines, apiCode })
}

export async function parseApiErrorResponse(res: Response): Promise<ApiRequestError> {
  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    return apiRequestErrorFromJson(res.status, {}, res.statusText)
  }
  return apiRequestErrorFromJson(res.status, raw, res.statusText)
}

/** Single block of text (e.g. inline alerts) including field errors from `details`. */
export function formatApiRequestErrorPlain(error: ApiRequestError): string {
  if (!error.detailLines.length) return error.message
  return [error.message, ...error.detailLines].filter(Boolean).join('\n')
}
