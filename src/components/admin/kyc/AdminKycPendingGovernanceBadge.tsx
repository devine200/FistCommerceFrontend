import { AdminGovernanceStatusBadge } from '@/admin/governance/AdminGovernanceStatusBadge'

type AdminKycPendingGovernanceBadgeProps = {
  proposalId: string | null | undefined
}

/** @deprecated Use AdminGovernanceStatusBadge from @/admin/governance */
export function AdminKycPendingGovernanceBadge({ proposalId }: AdminKycPendingGovernanceBadgeProps) {
  return (
    <AdminGovernanceStatusBadge
      proposalId={proposalId}
      governanceStatus={proposalId ? 'pending_signatures' : 'none'}
    />
  )
}
