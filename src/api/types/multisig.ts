export type ProposalStatus =
  | 'pending_signatures'
  | 'ready'
  | 'executed'
  | 'failed'
  | 'cancelled'

export type OperationType =
  | 'withdrawal_approve'
  | 'withdrawal_reject'
  | 'loan_fund'
  | 'loan_reject_funded'
  | 'payout_receivable'
  | 'kyc_status'
  | 'risk_tier'
  | 'protocol_pause'
  | 'protocol_deposits_pause'
  | 'protocol_withdrawals_pause'
  | 'protocol_funding_pause'
  | 'protocol_repayments_pause'
  | 'max_merchant_bps'
  | 'allocation_banker_year_days'
  | 'allocation_max_tenor_rate_bps'
  | 'funding_pool_min_deposit'
  | 'funding_pool_payout_router'
  | 'funding_pool_allocator'
  | 'funding_pool_withdrawal_duration'
  | 'funding_pool_withdrawal_gap'
  | 'payout_router_funding_pool'
  | 'payout_router_allocator'
  | 'payout_router_accepted_token'
  | 'payout_router_min_repayment'
  | 'multisig_add_signers'
  | 'multisig_remove_signers'
  | 'multisig_set_threshold'
  | 'multisig_signer_rotation'
  /** Fallback for operation types the backend introduces before the UI models them. */
  | 'unknown'

/**
 * Operation types the backend can emit. `unknown` is intentionally excluded — it is a
 * client-only fallback, never a value sent by (or requested from) the API.
 */
export const MULTISIG_OPERATION_TYPES = [
  'withdrawal_approve',
  'withdrawal_reject',
  'loan_fund',
  'loan_reject_funded',
  'payout_receivable',
  'kyc_status',
  'risk_tier',
  'protocol_pause',
  'protocol_deposits_pause',
  'protocol_withdrawals_pause',
  'protocol_funding_pause',
  'protocol_repayments_pause',
  'max_merchant_bps',
  'allocation_banker_year_days',
  'allocation_max_tenor_rate_bps',
  'funding_pool_min_deposit',
  'funding_pool_payout_router',
  'funding_pool_allocator',
  'funding_pool_withdrawal_duration',
  'funding_pool_withdrawal_gap',
  'payout_router_funding_pool',
  'payout_router_allocator',
  'payout_router_accepted_token',
  'payout_router_min_repayment',
  'multisig_add_signers',
  'multisig_remove_signers',
  'multisig_set_threshold',
  'multisig_signer_rotation',
] as const satisfies readonly OperationType[]

export type BackendKeyAlignment = {
  alignedBackendKeys: string[]
  misalignedBackendKeys: string[]
  allAligned: boolean
}

export type MultisigSignerMgmtSync = {
  multisigConfig: MultisigConfig
  backendKeyAlignment: BackendKeyAlignment
}

export type MultisigConfig = {
  chainId: number
  multisigAddress: string
  threshold: number
  signerCount: number
  signers: string[]
  handoffCompleted?: boolean
  servicerAddress?: string
}

export type MultisigProposalCall = {
  target: string
  calldata: string
  contract?: string
  function?: string
  decodedArgs?: Record<string, unknown>
}

export type MultisigProposalSignature = {
  signerAddress: string
  signedAt: string
}

export type MultisigPrecondition = {
  ok: boolean
  label?: string
  error?: string
}

export type ProposalListRow = {
  id: string
  operationType: OperationType
  status: ProposalStatus
  summary: string
  relatedType: string | null
  relatedId: string | null
  executionTxHash: string | null
  createdAt: string
  missingSigners: string[]
  validSignatureCount: number
  threshold: number
}

export type ProposalDetail = {
  id: string
  operationType: OperationType
  status: ProposalStatus
  summary: string
  calls: MultisigProposalCall[]
  signatures: MultisigProposalSignature[]
  validSignatureCount: number
  missingSigners: string[]
  readyToExecute: boolean
  simulationError: string | null
  preconditions: MultisigPrecondition[]
  executionTxHash: string | null
  relatedType: string | null
  relatedId: string | null
  threshold: number
  multisigAddress: string
  createdAt: string
}

export type SigningPayload = {
  proposalId: string
  digestToSign: `0x${string}`
  chainId: number
  nonce: number
  multisigAddress: string
  threshold: number
  signers: string[]
  signingNote: string
  calls: MultisigProposalCall[]
}

export type ExecuteProposalResult = {
  message: string
  txHash: string
  postExecuteSync?: unknown
}
