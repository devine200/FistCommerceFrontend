import type { AdminWriteOutcome } from '@/api/adminActionResponse'
import type { OperationType } from '@/api/types/multisig'

import type { ResolvedGovernanceOutcome } from './types'
import { isProposalQueuedOutcome } from './types'

export function resolveAdminWriteOutcome(
  outcome: AdminWriteOutcome,
  options?: { operationType?: OperationType },
): ResolvedGovernanceOutcome {
  if (isProposalQueuedOutcome(outcome)) {
    return {
      kind: 'proposal_queued',
      proposalId: outcome.proposalId,
      message: outcome.message,
      operationType: options?.operationType,
    }
  }

  return {
    kind: 'direct_complete',
    message: outcome.message,
    txHash: outcome.kind === 'completed' ? outcome.txHash : undefined,
    servicerGasWarning: outcome.kind === 'completed' ? outcome.servicerGasWarning : undefined,
  }
}
