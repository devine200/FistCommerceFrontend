import { formatApiRequestErrorPlain, ApiRequestError } from '@/api/apiRequestError'
import { classifyAppError, type AppErrorContext } from '@/errors/classify'
import { messageForCode } from '@/errors/messages'

export type ToAppUserFacingErrorOptions = {
  fallback?: string
  context?: AppErrorContext
}

/**
 * Maps API / wallet / contract failures to short user-facing copy.
 * Raw technical details stay out of modals; use classifyAppError().raw for logs.
 */
export function toAppUserFacingError(
  error: unknown,
  fallbackOrOptions?: string | ToAppUserFacingErrorOptions,
): string {
  const options: ToAppUserFacingErrorOptions =
    typeof fallbackOrOptions === 'string'
      ? { fallback: fallbackOrOptions }
      : (fallbackOrOptions ?? {})
  const fallback = options.fallback?.trim() || messageForCode('UNKNOWN')
  const context = options.context ?? 'general'

  if (typeof error === 'string') {
    const trimmed = error.trim()
    if (!trimmed) return fallback
    const classified = classifyAppError(trimmed, context)
    return classified.message || fallback
  }

  // Preserve DRF field lists when present and not overridden by a stronger code.
  if (error instanceof ApiRequestError && error.detailLines.length) {
    const classified = classifyAppError(error, context)
    if (
      classified.code === 'API_VALIDATION' ||
      classified.code === 'API_MESSAGE' ||
      classified.code === 'UNKNOWN'
    ) {
      return formatApiRequestErrorPlain(error).trim() || fallback
    }
    return classified.message || fallback
  }

  const classified = classifyAppError(error, context)
  if (classified.code === 'UNKNOWN' && !classified.raw) return fallback
  if (classified.code === 'UNKNOWN' && classified.message === messageForCode('UNKNOWN')) {
    return fallback
  }
  return classified.message || fallback
}
