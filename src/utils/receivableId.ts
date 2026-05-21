import { isHex, keccak256, toBytes } from 'viem'

/**
 * Normalizes API / chain receivable identifiers to `bytes32` for contract calls.
 * Accepts `0x` + 64 hex, bare 64 hex, or UUID strings (keccak256 of UTF-8).
 */
export function normalizeReceivableIdToBytes32(
  value: string | null | undefined,
): `0x${string}` | null {
  const raw = value?.trim() ?? ''
  if (!raw) return null

  if (isHex(raw, { strict: true }) && raw.length === 66) {
    return raw as `0x${string}`
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return `0x${raw}` as `0x${string}`
  }

  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(raw)) {
    return keccak256(toBytes(raw))
  }

  return null
}
