import type { AdminWriteOutcome } from '@/api/adminActionResponse'
import type { OperationType } from '@/api/types/multisig'

export type ResolvedGovernanceOutcome =
  | {
      kind: 'direct_complete'
      message: string
      txHash?: string
      servicerGasWarning?: string
    }
  | {
      kind: 'proposal_queued'
      proposalId: string
      message: string
      operationType?: OperationType
    }

export type GovernanceSignSubmitResult = {
  proposalId: string
  signature: string
  validSignatureCount: number
  threshold: number
  readyToExecute: boolean
  signingNote: string
}

export type SubmitAdminActionOptions = {
  operationType?: OperationType
}

export function isProposalQueuedOutcome(
  outcome: AdminWriteOutcome,
): outcome is Extract<AdminWriteOutcome, { kind: 'governance_queued' | 'proposal_created' }> {
  return outcome.kind === 'governance_queued' || outcome.kind === 'proposal_created'
}
