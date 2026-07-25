import { toAppUserFacingError } from '@/errors/toAppUserFacingError'

/**
 * Turns wallet / contract errors into short, user-facing copy.
 * Passes through messages that already look human-written (e.g. gate checks from hooks).
 */
export function formatFlowFailureMessage(source: unknown): string {
  return toAppUserFacingError(source, {
    fallback: 'Something went wrong. Please try again.',
    context: 'general',
  })
}
