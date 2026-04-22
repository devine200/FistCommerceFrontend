/** Compact `0x` address for headers (e.g. `0x7A3f...92c1`). */
export function formatWalletAddressForTopBar(address: string): string {
  const a = address.trim()
  if (a.length < 12) return a
  return `${a.slice(0, 6)}...${a.slice(-4)}`
}
