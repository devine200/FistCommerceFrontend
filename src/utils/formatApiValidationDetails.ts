/**
 * Flattens Django REST / DRF-style validation payloads (`details` on 400 responses)
 * into readable lines, e.g. `{ "email": ["Invalid email."] }` → `["Email: Invalid email."]`.
 */
function humanizeFieldKey(key: string): string {
  const s = key.replace(/_/g, ' ').replace(/\./g, ' — ')
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function formatDrfValidationDetails(details: unknown): string[] {
  if (details == null) return []

  const lines: string[] = []

  const walk = (prefix: string, value: unknown): void => {
    if (value == null) return

    if (typeof value === 'string') {
      const line = prefix ? `${humanizeFieldKey(prefix)}: ${value}` : value
      lines.push(line)
      return
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return
      const allStrings = value.every((v) => typeof v === 'string')
      if (allStrings) {
        const label = prefix ? `${humanizeFieldKey(prefix)}: ` : ''
        for (const part of value as string[]) {
          lines.push(`${label}${part}`.trim())
        }
        return
      }
      for (const item of value) walk(prefix, item)
      return
    }

    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const next = prefix ? `${prefix}.${k}` : k
        walk(next, v)
      }
    }
  }

  walk('', details)
  return lines
}
