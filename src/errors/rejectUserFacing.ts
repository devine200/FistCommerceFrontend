import { toAppUserFacingError } from '@/errors/toAppUserFacingError'

/** Redux `rejectWithValue` payload: always a short user-facing string. */
export function rejectUserFacing(error: unknown, fallback: string): string {
  return toAppUserFacingError(error, fallback)
}
