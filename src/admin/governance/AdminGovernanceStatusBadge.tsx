import { Link } from 'react-router-dom'

import { adminGovernanceProposalPath } from '@/api/adminActionResponse'
import type { ProposalStatus } from '@/api/types/multisig'
import { AdminStatusPill } from '@/components/admin/primitives'
import {
  requestGovernancePillVariant,
  requestGovernanceStatusLabel,
} from '@/components/admin/governance/adminGovernanceUi'

type AdminGovernanceStatusBadgeProps = {
  proposalId?: string | null
  governanceStatus?: ProposalStatus | 'none' | string
  className?: string
}

export function AdminGovernanceStatusBadge({
  proposalId,
  governanceStatus = 'none',
  className,
}: AdminGovernanceStatusBadgeProps) {
  const id = proposalId?.trim()
  const status = governanceStatus?.trim() || 'none'
  const label = requestGovernanceStatusLabel(status, id ?? null)
  if (!label && !id) return null

  const pill = (
    <AdminStatusPill variant={requestGovernancePillVariant(status, id ?? null)}>
      {label || 'On-chain pending'}
    </AdminStatusPill>
  )

  if (!id) {
    return <span className={className}>{pill}</span>
  }

  return (
    <Link to={adminGovernanceProposalPath(id)} className={['inline-flex', className].filter(Boolean).join(' ')}>
      {pill}
    </Link>
  )
}
