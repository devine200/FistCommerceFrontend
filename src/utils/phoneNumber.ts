function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, '').length
}

/** True when stripped input has 7–15 digits (E.164 max); rejects all-zero “numbers”. */
export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const n = countPhoneDigits(trimmed)
  if (n < 7 || n > 18) return false
  if (/^0+$/.test(trimmed.replace(/\D/g, ''))) return false
  return true
}

export const PHONE_VALIDITY_HINT =
  'Enter a valid phone number: 7–15 digits, optional + and separators (e.g. +1 234 567 8900).'
