import type { FetchMultisigProposalsParams } from '@/api/multisig/proposals'
import type { ProposalListRow, ProposalStatus } from '@/api/types/multisig'

/** Single API fetch key — status tabs filter this list client-side only. */
export const GOVERNANCE_FULL_LIST_FILTER = {
  status: 'all',
  operationType: 'all',
} as const satisfies FetchMultisigProposalsParams

export function governanceListCacheKey(filter: FetchMultisigProposalsParams = {}): string {
  const status = filter.status ?? 'all'
  const operationType = filter.operationType ?? 'all'
  return `${status}:${operationType}`
}

export function filterGovernanceProposalsByStatus(
  rows: ProposalListRow[],
  status: ProposalStatus | 'all',
): ProposalListRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

export function governanceProposalListsEqual(
  a: ProposalListRow[],
  b: ProposalListRow[],
): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    if (row.id !== other.id) return false
    if (row.status !== other.status) return false
    if (row.summary !== other.summary) return false
    if (row.executionTxHash !== other.executionTxHash) return false
    if (row.validSignatureCount !== other.validSignatureCount) return false
    if (row.relatedId !== other.relatedId) return false
    if (row.missingSigners.length !== other.missingSigners.length) return false
    return row.missingSigners.every((signer, i) => signer === other.missingSigners[i])
  })
}
