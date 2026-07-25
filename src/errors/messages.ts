import type { AppErrorCode } from '@/errors/codes'

const MESSAGES: Record<AppErrorCode, string> = {
  AUTH_REQUIRED: 'Sign in again to continue.',
  API_UNAUTHORIZED: 'Your session expired. Sign in again.',
  API_FORBIDDEN: 'You don’t have permission for this action.',
  API_NOT_FOUND: 'We couldn’t find that resource. Refresh and try again.',
  API_VALIDATION: 'Please correct the highlighted fields and try again.',
  API_CONFLICT: 'This action conflicts with the current state. Refresh and try again.',
  API_SERVER: 'Something went wrong on the server. Try again in a moment.',
  API_NETWORK: 'Check your connection and try again.',
  API_MESSAGE: 'Something went wrong. Please try again.',
  WALLET_NOT_CONNECTED: 'Connect your wallet to continue.',
  WALLET_REJECTED: 'You cancelled the request in your wallet. Try again when you are ready.',
  WRONG_NETWORK: 'Switch your wallet to the correct network to continue.',
  CHAIN_SWITCH_REJECTED: 'Network switch was cancelled. Approve the prompt in your wallet.',
  CHAIN_SWITCH_FAILED:
    'Couldn’t switch networks. Enable the network in your wallet settings and try again.',
  INSUFFICIENT_NATIVE:
    'Your wallet does not have enough native token on this network to pay the transaction fee.',
  GAS_PRICE_STALE: 'Network gas price moved before your transaction was sent. Please try again.',
  ALLOWANCE_REQUIRED: 'Approve token spending in your wallet, then try again.',
  INSUFFICIENT_TOKEN: 'Insufficient token balance for this amount.',
  TX_REVERTED: 'The transaction failed on-chain. Try again or contact support.',
  CONTRACT_REVERT: 'The transaction was rejected by the contract. Try again or contact support.',
  SIGN_PAYLOAD_MISSING:
    'Signing data from the server is incomplete. Refresh the proposal or contact ops.',
  SIGN_PAYLOAD_MISMATCH:
    'Signing data doesn’t match this proposal. Don’t sign — refresh or contact ops.',
  SIGN_TYPED_DATA_FAILED:
    'Your wallet couldn’t sign the approval. Unlock the wallet, confirm the network, and try again.',
  EXEC_PAYLOAD_ERROR: 'Execution could not be prepared. Refresh the proposal or contact ops.',
  EXEC_PAYLOAD_MALFORMED:
    'Execution data from the server is incomplete. Refresh the proposal or contact ops.',
  EXEC_SIM_AA24:
    'On-chain signature check failed (AA24). Owner signatures may be invalid or the proposal changed. Contact ops before retrying.',
  EXEC_SIM_FAILED:
    'Execution simulation failed. Contact ops with this proposal id before retrying.',
  EXEC_TX_REVERTED: 'On-chain execution reverted. Contact ops with the transaction details.',
  EXEC_CONFIRM_FAILED:
    'The transaction may have succeeded on-chain, but the server couldn’t confirm it. Share the transaction hash with ops.',
  SESSION_WALLET_MISMATCH: 'Reconnect the wallet used for this admin login.',
  NOT_MULTISIG_OWNER: 'Connected wallet is not a multisig owner for this deployment.',
  PROTOCOL_PAUSED: 'The protocol is temporarily paused. Try again later.',
  DEPOSITS_PAUSED: 'Deposits are temporarily paused. Try again later.',
  WITHDRAWALS_PAUSED: 'Withdrawals are temporarily paused. Try again later.',
  FUNDING_PAUSED: 'New funding and loan requests are temporarily paused. Try again later.',
  UNKNOWN: 'Something went wrong. Please try again.',
}

export function messageForCode(code: AppErrorCode): string {
  return MESSAGES[code]
}
