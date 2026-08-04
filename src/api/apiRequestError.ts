import { formatDrfValidationDetails } from '@/utils/formatApiValidationDetails'

export class ApiRequestError extends Error {
  readonly status: number
  /** Normalized field / serializer messages from `details` when present. */
  readonly detailLines: readonly string[]
  /** Stable API error code from JSON `code` when present. */
  readonly apiCode?: string
  /** Structured API `details` object when the backend sends one (e.g. blockingProposalIds). */
  readonly apiDetails?: Readonly<Record<string, unknown>>

  constructor(
    message: string,
    status: number,
    options?: {
      detailLines?: readonly string[]
      apiCode?: string
      apiDetails?: Readonly<Record<string, unknown>>
    },
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.detailLines = options?.detailLines?.length ? [...options.detailLines] : []
    this.apiCode = options?.apiCode?.trim() || undefined
    this.apiDetails =
      options?.apiDetails && Object.keys(options.apiDetails).length > 0
        ? options.apiDetails
        : undefined
  }
}

function pickTrimmedString(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

/** DRF field-error maps use string/list values; structured API details use nested objects/arrays. */
function looksLikeFieldErrors(details: Record<string, unknown>): boolean {
  return Object.values(details).every(
    (v) =>
      typeof v === 'string' ||
      (Array.isArray(v) && v.every((item) => typeof item === 'string')),
  )
}

function pickStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).map((s) => s.trim())
}

/** Extract blocking proposal UUIDs from a multisig preflight API error. */
export function blockingProposalIdsFromApiError(error: unknown): string[] {
  if (!(error instanceof ApiRequestError) || !error.apiDetails) return []
  return pickStringArray(
    error.apiDetails.blockingProposalIds ?? error.apiDetails.blocking_proposal_ids,
  )
}

export type ExecuteQueueJumpWarningDetails = {
  message: string
  blockingProposalIds: string[]
  willInvalidateOthers: boolean
  liveNonce: number | null
  reservedNonce: number | null
  requiresResign: boolean
}

function pickNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

/** Parse queue-jump execute warning from EXECUTE_QUEUE_JUMP_ACK_REQUIRED preflight errors. */
export function executeQueueJumpWarningFromApiError(
  error: unknown,
): ExecuteQueueJumpWarningDetails | null {
  if (!(error instanceof ApiRequestError)) return null
  if (error.apiCode !== 'EXECUTE_QUEUE_JUMP_ACK_REQUIRED') return null
  const details = error.apiDetails ?? {}
  const message =
    pickTrimmedString(details.message) ||
    pickTrimmedString(error.message) ||
    'This proposal is not at the live on-chain nonce.'
  return {
    message,
    blockingProposalIds: pickStringArray(
      details.blockingProposalIds ?? details.blocking_proposal_ids,
    ),
    willInvalidateOthers: details.willInvalidateOthers === true || details.will_invalidate_others === true,
    liveNonce: pickNullableNumber(details.liveNonce ?? details.live_nonce),
    reservedNonce: pickNullableNumber(details.reservedNonce ?? details.reserved_nonce),
    requiresResign: details.requiresResign === true || details.requires_resign === true,
  }
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

  const rawDetails = data.details
  const apiDetails =
    rawDetails && typeof rawDetails === 'object' && !Array.isArray(rawDetails)
      ? (rawDetails as Record<string, unknown>)
      : undefined

  const detailLines = formatDrfValidationDetails(
    apiDetails && !Array.isArray(apiDetails) && looksLikeFieldErrors(apiDetails)
      ? apiDetails
      : data.non_field_errors,
  )

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

  return new ApiRequestError(normalizedHeadline, status, {
    detailLines: lines,
    apiCode,
    apiDetails,
  })
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
