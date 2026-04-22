/**
 * Turns wallet / contract errors into short, user-facing copy.
 * Passes through messages that already look human-written (e.g. gate checks from hooks).
 */
export function formatFlowFailureMessage(source: unknown): string {
  const text =
    typeof source === 'string'
      ? source
      : source instanceof Error
        ? source.message
        : 'Something went wrong. Please try again.'

  const trimmed = text.trim()
  if (!trimmed) return 'Something went wrong. Please try again.'

  if (!looksTechnical(trimmed)) return clipped(trimmed, 400)

  if (/user rejected|user denied|rejected the request|ACTION_REJECTED|4001/i.test(trimmed)) {
    return 'You cancelled the request in your wallet. Try again when you are ready.'
  }
  if (/insufficient funds|insufficient funds for gas/i.test(trimmed)) {
    return 'Your wallet does not have enough native token on this network to pay the transaction fee.'
  }

  const quoted = trimmed.match(/execution reverted:\s*"([^"]+)"/i)?.[1]?.trim()
  if (quoted) return clipped(humanizeRevertToken(quoted), 220)

  const reason = trimmed.match(/reverted with the following reason:\s*([^\n.]+)/i)?.[1]?.trim()
  if (reason) return clipped(humanizeRevertToken(reason), 220)

  const reason2 = trimmed.match(/reason:\s*([^\n.]+)/i)?.[1]?.trim()
  if (reason2 && reason2.length < 140) return clipped(humanizeRevertToken(reason2), 220)

  return 'Something went wrong while processing your request. Please try again.'
}

function looksTechnical(msg: string): boolean {
  if (/0x[a-fA-F0-9]{20,}/.test(msg)) return true
  if (/ContractFunction|Request Arguments|AbiEncoding|TransactionExecutionError|InternalRpcError/i.test(msg))
    return true
  if (msg.length > 500) return true
  return false
}

function humanizeRevertToken(s: string): string {
  return s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

function clipped(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trim()}…`
}
