/** Compact wallet label for forms (e.g. `0x7A3f…92c1`). */
export function shortWalletDisplay(full: string | null | undefined, fallback = '—'): string {
  const a = full?.trim() ?? ''
  if (!a) return fallback
  if (a.length <= 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
