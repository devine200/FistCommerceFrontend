/**
 * Strip a trailing `:<chainId>` suffix from a composite user key
 * (e.g. `0xabc…:421614` → `0xabc…`). Bare wallets are returned unchanged.
 */
export function walletFromUserKey(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return trimmed.replace(/:\d+$/, '')
}
