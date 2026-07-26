import { ApiRequestError } from '@/api/apiRequestError'
import type { AppErrorCode } from '@/errors/codes'
import { messageForCode } from '@/errors/messages'
import { isUserRejectedWalletRequest, WalletChainSwitchError } from '@/wallet/walletChainErrors'

export type AppErrorContext =
  | 'general'
  | 'governance_sign'
  | 'governance_execute'
  | 'invest'
  | 'withdraw'
  | 'repay'
  | 'kyc'
  | 'onboarding'
  | 'mint'

export type ClassifiedAppError = {
  code: AppErrorCode
  /** Preferred user-facing text (may include API field details). */
  message: string
  /** Original text used for classification (for logging). */
  raw: string
}

function rawText(error: unknown): string {
  if (typeof error === 'string') return error.trim()
  if (error instanceof Error) return error.message.trim()
  return ''
}

function looksTechnical(msg: string): boolean {
  if (/0x[a-fA-F0-9]{40,}/.test(msg)) return true
  if (/ContractFunction|Request Arguments|AbiEncoding|TransactionExecutionError|InternalRpcError/i.test(msg))
    return true
  if (/signTypedData|eth_sign|wallet_switchEthereumChain/i.test(msg) && msg.length > 120) return true
  if (msg.length > 500) return true
  return false
}

function clipped(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trim()}…`
}

function humanizeRevertToken(s: string): string {
  return s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Decode ASCII from hex blobs like `41413234…` when present in AA errors. */
function decodeEmbeddedAsciiHex(text: string): string | null {
  const match = text.match(/([0-9a-fA-F]{16,})/)
  if (!match) return null
  const hex = match[1]!
  if (hex.length % 2 !== 0) return null
  try {
    let out = ''
    for (let i = 0; i < hex.length; i += 2) {
      const code = Number.parseInt(hex.slice(i, i + 2), 16)
      if (code < 32 || code > 126) {
        if (code === 0) continue
        return out.trim() || null
      }
      out += String.fromCharCode(code)
    }
    const trimmed = out.trim()
    return trimmed.length >= 4 ? trimmed : null
  } catch {
    return null
  }
}

function stripHexNoise(text: string): string {
  return text
    .replace(/0x[a-fA-F0-9]{64,}/g, '')
    .replace(/\('[0-9a-fA-F]{20,}'(?:,\s*'[0-9a-fA-F]{20,}')*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** RPC / viem phrasing for “not enough ETH to pay gas” on the *caller* wallet. */
function isInsufficientNativeGasText(text: string): boolean {
  return (
    /insufficient funds(?:\s+for\s+gas)?/i.test(text) ||
    /not enough (?:ETH|native(?:\s+token)?).*(?:gas|fee|transaction)/i.test(text) ||
    /(?:gas|fee|transaction).*(?:not enough|insufficient).*(?:ETH|native)/i.test(text)
  )
}

/** ERC-4337 prefund / deposit failures — not the end-user EOA signing the outer tx. */
function isAccountPrefundGasText(text: string): boolean {
  return /AA21|didn'?t pay prefund|did not pay prefund|missingAccountFunds/i.test(text)
}

/**
 * Backend-relayed actions fail when the *servicer* (or related ops wallet) cannot pay gas.
 * Prefer this over blaming the end-user wallet.
 */
function isServicerInsufficientNativeText(text: string): boolean {
  if (
    !isInsufficientNativeGasText(text) &&
    !isAccountPrefundGasText(text) &&
    !/low(?:\s+|_ )?balance|gas\s+warning/i.test(text)
  ) {
    return false
  }
  return /servicer|relay(?:er)?|ops wallet|protocol wallet/i.test(text)
}

function classifyFromText(text: string, context: AppErrorContext): ClassifiedAppError | null {
  const t = text.trim()
  if (!t) return null

  if (/AA24|signature error/i.test(t)) {
    return { code: 'EXEC_SIM_AA24', message: messageForCode('EXEC_SIM_AA24'), raw: t }
  }
  if (/EntryPoint handleOps simulation failed|handleOps simulation failed/i.test(t)) {
    const decoded = decodeEmbeddedAsciiHex(t)
    if (decoded && /AA24|signature/i.test(decoded)) {
      return { code: 'EXEC_SIM_AA24', message: messageForCode('EXEC_SIM_AA24'), raw: t }
    }
    return { code: 'EXEC_SIM_FAILED', message: messageForCode('EXEC_SIM_FAILED'), raw: t }
  }

  if (
    /missing required EIP-712 typedData|typedData is incomplete/i.test(t) ||
    (context === 'governance_sign' && /signing payload.*missing/i.test(t))
  ) {
    return { code: 'SIGN_PAYLOAD_MISSING', message: messageForCode('SIGN_PAYLOAD_MISSING'), raw: t }
  }
  if (
    /typedData domain\.|verifyingContract|userOpHashToSign|primaryType must be/i.test(t) ||
    /does not match (payload chainId|multisigAddress|userOpHashToSign)/i.test(t)
  ) {
    return { code: 'SIGN_PAYLOAD_MISMATCH', message: messageForCode('SIGN_PAYLOAD_MISMATCH'), raw: t }
  }
  if (/Wallet could not EIP-712-sign|signTypedData/i.test(t)) {
    if (/user rejected|denied|cancelled|canceled/i.test(t)) {
      return { code: 'WALLET_REJECTED', message: messageForCode('WALLET_REJECTED'), raw: t }
    }
    return { code: 'SIGN_TYPED_DATA_FAILED', message: messageForCode('SIGN_TYPED_DATA_FAILED'), raw: t }
  }

  if (
    /Execution payload response was missing required fields/i.test(t) ||
    /execution data from the server is incomplete/i.test(t)
  ) {
    return { code: 'EXEC_PAYLOAD_MALFORMED', message: messageForCode('EXEC_PAYLOAD_MALFORMED'), raw: t }
  }
  if (/EntryPoint handleOps transaction reverted/i.test(t)) {
    return { code: 'EXEC_TX_REVERTED', message: messageForCode('EXEC_TX_REVERTED'), raw: t }
  }
  if (/confirm-execute|couldn.?t confirm/i.test(t) && context === 'governance_execute') {
    return { code: 'EXEC_CONFIRM_FAILED', message: messageForCode('EXEC_CONFIRM_FAILED'), raw: t }
  }

  if (/must match the wallet used for this admin login|Reconnect the wallet used/i.test(t)) {
    return { code: 'SESSION_WALLET_MISMATCH', message: messageForCode('SESSION_WALLET_MISMATCH'), raw: t }
  }
  if (/not (an on-chain )?multisig (signer|owner)/i.test(t)) {
    return { code: 'NOT_MULTISIG_OWNER', message: messageForCode('NOT_MULTISIG_OWNER'), raw: t }
  }

  if (/user rejected|user denied|rejected the request|ACTION_REJECTED|4001|cancelled the request in your wallet/i.test(t)) {
    return { code: 'WALLET_REJECTED', message: messageForCode('WALLET_REJECTED'), raw: t }
  }
  // Servicer/ops gas (loan fund, repay submit, admin writes) — not the end-user wallet.
  if (isServicerInsufficientNativeText(t) || isAccountPrefundGasText(t)) {
    return {
      code: 'SERVICER_INSUFFICIENT_NATIVE',
      message: messageForCode('SERVICER_INSUFFICIENT_NATIVE'),
      raw: t,
    }
  }
  if (isInsufficientNativeGasText(t)) {
    return { code: 'INSUFFICIENT_NATIVE', message: messageForCode('INSUFFICIENT_NATIVE'), raw: t }
  }
  if (/max fee per gas less than block base fee/i.test(t)) {
    return { code: 'GAS_PRICE_STALE', message: messageForCode('GAS_PRICE_STALE'), raw: t }
  }
  if (/insufficient allowance|exceeds allowance|approve tokens/i.test(t)) {
    return { code: 'ALLOWANCE_REQUIRED', message: messageForCode('ALLOWANCE_REQUIRED'), raw: t }
  }
  if (/transfer amount exceeds balance|insufficient token balance/i.test(t)) {
    return { code: 'INSUFFICIENT_TOKEN', message: messageForCode('INSUFFICIENT_TOKEN'), raw: t }
  }
  if (/deposits? paused/i.test(t)) {
    return { code: 'DEPOSITS_PAUSED', message: messageForCode('DEPOSITS_PAUSED'), raw: t }
  }
  if (/withdrawals? paused/i.test(t)) {
    return { code: 'WITHDRAWALS_PAUSED', message: messageForCode('WITHDRAWALS_PAUSED'), raw: t }
  }
  if (/funding paused/i.test(t)) {
    return { code: 'FUNDING_PAUSED', message: messageForCode('FUNDING_PAUSED'), raw: t }
  }
  if (/\bpaused\b/i.test(t) && /protocol|controller/i.test(t)) {
    return { code: 'PROTOCOL_PAUSED', message: messageForCode('PROTOCOL_PAUSED'), raw: t }
  }
  if (/max.?merchant|merchant.?concentration|concentration.?limit|setMaxMerchantBps/i.test(t)) {
    return {
      code: 'MERCHANT_CONCENTRATION',
      message: messageForCode('MERCHANT_CONCENTRATION'),
      raw: t,
    }
  }
  if (/kyc.*(required|incomplete|not verified)|complete.*(kyc|identity|verification)/i.test(t)) {
    return { code: 'KYC_REQUIRED', message: messageForCode('KYC_REQUIRED'), raw: t }
  }
  if (/^request failed \(\d+\)$/i.test(t) || /^(bad request|unauthorized|forbidden|not found)$/i.test(t)) {
    return { code: 'API_MESSAGE', message: messageForCode('API_MESSAGE'), raw: t }
  }

  const quoted = t.match(/execution reverted:\s*"([^"]+)"/i)?.[1]?.trim()
  if (quoted) {
    return {
      code: 'CONTRACT_REVERT',
      message: clipped(humanizeRevertToken(quoted), 220),
      raw: t,
    }
  }
  const reason = t.match(/reverted with the following reason:\s*([^\n.]+)/i)?.[1]?.trim()
  if (reason) {
    return {
      code: 'CONTRACT_REVERT',
      message: clipped(humanizeRevertToken(reason), 220),
      raw: t,
    }
  }

  if (/Network switch .* was cancelled/i.test(t)) {
    return { code: 'CHAIN_SWITCH_REJECTED', message: t, raw: t }
  }
  if (/Could not switch/i.test(t)) {
    return { code: 'CHAIN_SWITCH_FAILED', message: t, raw: t }
  }

  return null
}

function classifyApiRequestError(error: ApiRequestError): ClassifiedAppError {
  const raw = [error.message, ...error.detailLines].filter(Boolean).join('\n').trim()
  // HTTP APIs that hit the chain use the servicer (loan request, repay submit, admin writes).
  // Never map those "insufficient funds" responses to the end-user wallet message.
  if (
    isInsufficientNativeGasText(raw) ||
    isAccountPrefundGasText(raw) ||
    isServicerInsufficientNativeText(raw)
  ) {
    return {
      code: 'SERVICER_INSUFFICIENT_NATIVE',
      message: messageForCode('SERVICER_INSUFFICIENT_NATIVE'),
      raw,
    }
  }
  const fromText = classifyFromText(raw, 'general')
  if (fromText) {
    if (error.detailLines.length && fromText.code === 'API_MESSAGE') {
      return {
        code: 'API_VALIDATION',
        message: raw,
        raw,
      }
    }
    return fromText
  }

  if (error.status === 401) {
    return { code: 'API_UNAUTHORIZED', message: messageForCode('API_UNAUTHORIZED'), raw }
  }
  if (error.status === 403) {
    return { code: 'API_FORBIDDEN', message: messageForCode('API_FORBIDDEN'), raw }
  }
  if (error.status === 404) {
    return { code: 'API_NOT_FOUND', message: messageForCode('API_NOT_FOUND'), raw }
  }
  if (error.status === 409) {
    return { code: 'API_CONFLICT', message: messageForCode('API_CONFLICT'), raw }
  }
  if (error.status >= 500) {
    return { code: 'API_SERVER', message: messageForCode('API_SERVER'), raw }
  }
  if (error.detailLines.length) {
    return {
      code: 'API_VALIDATION',
      message: raw || messageForCode('API_VALIDATION'),
      raw,
    }
  }

  const cleaned = stripHexNoise(error.message)
  if (cleaned && !looksTechnical(cleaned)) {
    return { code: 'API_MESSAGE', message: clipped(cleaned, 400), raw }
  }
  if (error.status >= 400 && error.status < 500) {
    return {
      code: 'API_MESSAGE',
      message: cleaned && !looksTechnical(cleaned) ? clipped(cleaned, 400) : messageForCode('API_MESSAGE'),
      raw,
    }
  }
  return { code: 'API_SERVER', message: messageForCode('API_SERVER'), raw }
}

export function classifyAppError(
  error: unknown,
  context: AppErrorContext = 'general',
): ClassifiedAppError {
  if (error instanceof WalletChainSwitchError) {
    if (error.userRejected || isUserRejectedWalletRequest(error.causeError)) {
      return {
        code: 'CHAIN_SWITCH_REJECTED',
        message: error.message || messageForCode('CHAIN_SWITCH_REJECTED'),
        raw: error.message,
      }
    }
    return {
      code: 'CHAIN_SWITCH_FAILED',
      message: error.message || messageForCode('CHAIN_SWITCH_FAILED'),
      raw: error.message,
    }
  }

  if (isUserRejectedWalletRequest(error)) {
    return {
      code: 'WALLET_REJECTED',
      message: messageForCode('WALLET_REJECTED'),
      raw: rawText(error),
    }
  }

  if (error instanceof ApiRequestError) {
    return classifyApiRequestError(error)
  }

  const text = rawText(error)
  const fromText = classifyFromText(text, context)
  if (fromText) return fromText

  if (text && !looksTechnical(text)) {
    return { code: 'UNKNOWN', message: clipped(text, 400), raw: text }
  }

  if (text) {
    const cleaned = stripHexNoise(text)
    if (cleaned && !looksTechnical(cleaned) && cleaned.length >= 12) {
      return { code: 'UNKNOWN', message: clipped(cleaned, 400), raw: text }
    }
  }

  return {
    code: 'UNKNOWN',
    message: messageForCode('UNKNOWN'),
    raw: text,
  }
}
