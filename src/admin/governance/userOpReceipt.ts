import type { Hex, Log, TransactionReceipt } from 'viem'
import { keccak256, toBytes } from 'viem'

const USER_OPERATION_EVENT_TOPIC0 = keccak256(
  toBytes('UserOperationEvent(bytes32,address,address,uint256,bool,uint256,uint256)'),
).toLowerCase()

/**
 * Decode UserOperationEvent.success from an EntryPoint handleOps receipt.
 * Returns null when the event is missing or undecodable.
 */
export function userOpSuccessFromHandleOpsReceipt(
  receipt: Pick<TransactionReceipt, 'logs' | 'status'>,
): boolean | null {
  if (receipt.status !== 'success') return false

  for (const log of receipt.logs as Log[]) {
    const topic0 = (log.topics?.[0] || '').toLowerCase()
    if (topic0 !== USER_OPERATION_EVENT_TOPIC0) continue
    const data = (log.data || '') as Hex | string
    const hex = typeof data === 'string' && data.startsWith('0x') ? data.slice(2) : String(data)
    // nonce(32) + success(32) + ...
    if (hex.length < 128) return null
    const successWord = hex.slice(64, 128)
    try {
      return BigInt(`0x${successWord}`) !== 0n
    } catch {
      return null
    }
  }
  return null
}
