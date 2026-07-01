import type { AdminRequestRow, AdminRequestStatus, AdminRequestTypeFilter } from '@/api/adminRequests'
import { displayDashboardCompactUsd } from '@/api/metrics'
import type { AdminPillVariant } from '@/components/admin/primitives'
import {
  requestGovernancePillVariant,
  requestGovernanceStatusLabel,
} from '@/components/admin/governance/adminGovernanceUi'

export type PayoutWithdrawalStatus = AdminRequestStatus

export type PayoutWithdrawalTypeTab = 'All' | 'Withdrawals' | 'Payouts'

export function typeTabToApiFilter(tab: PayoutWithdrawalTypeTab): AdminRequestTypeFilter {
  switch (tab) {
    case 'Withdrawals':
      return 'withdrawal'
    case 'Payouts':
      return 'disbursement'
    default:
      return 'all'
  }
}

export function formatPayoutWithdrawalSummaryMoney(amount: string): string {
  return displayDashboardCompactUsd(amount)
}

export function formatPayoutWithdrawalCount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function payoutWithdrawalStatusLabel(
  status: PayoutWithdrawalStatus,
  row?: Pick<AdminRequestRow, 'pendingGovernanceProposalId' | 'governanceStatus'>,
): string {
  const governanceLabel = row
    ? requestGovernanceStatusLabel(row.governanceStatus, row.pendingGovernanceProposalId)
    : ''
  if (governanceLabel) return governanceLabel
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Pending'
  }
}

export function payoutWithdrawalStatusPillVariant(
  status: PayoutWithdrawalStatus,
  row?: Pick<AdminRequestRow, 'pendingGovernanceProposalId' | 'governanceStatus'>,
): AdminPillVariant {
  if (row) {
    const gov = requestGovernancePillVariant(row.governanceStatus, row.pendingGovernanceProposalId)
    if (requestGovernanceStatusLabel(row.governanceStatus, row.pendingGovernanceProposalId)) return gov
  }
  switch (status) {
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    default:
      return 'pending'
  }
}
