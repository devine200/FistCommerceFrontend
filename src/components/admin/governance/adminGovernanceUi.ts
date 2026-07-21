import type { OperationType, ProposalStatus } from '@/api/types/multisig'
import type { AdminPillVariant } from '@/components/admin/primitives'

export function governanceStatusPillVariant(status: ProposalStatus): AdminPillVariant {
  switch (status) {
    case 'executed':
      return 'approved'
    case 'failed':
      return 'rejected'
    case 'ready':
      return 'underReview'
    case 'cancelled':
      return 'neutral'
    default:
      return 'pending'
  }
}

export function governanceOperationLabel(type: OperationType): string {
  switch (type) {
    case 'withdrawal_approve':
      return 'Withdrawal approval'
    case 'withdrawal_reject':
      return 'Withdrawal rejection'
    case 'loan_fund':
      return 'Fund loan'
    case 'loan_reject_funded':
      return 'Reject funded loan'
    case 'payout_receivable':
      return 'Funding payout'
    case 'kyc_status':
      return 'KYC status'
    case 'risk_tier':
      return 'Risk tier'
    case 'protocol_pause':
      return 'Protocol pause'
    case 'protocol_deposits_pause':
      return 'Deposits pause'
    case 'protocol_withdrawals_pause':
      return 'Withdrawals pause'
    case 'protocol_funding_pause':
      return 'Funding pause'
    case 'protocol_repayments_pause':
      return 'Repayments pause'
    case 'max_merchant_bps':
      return 'Max merchant concentration'
    case 'allocation_banker_year_days':
      return 'Banker year days'
    case 'allocation_max_tenor_rate_bps':
      return 'Max tenor rate'
    case 'funding_pool_min_deposit':
      return 'Funding pool min deposit'
    case 'funding_pool_payout_router':
      return 'Funding pool payout router'
    case 'funding_pool_allocator':
      return 'Funding pool allocator'
    case 'funding_pool_withdrawal_duration':
      return 'Withdrawal request duration'
    case 'funding_pool_withdrawal_gap':
      return 'Withdrawal request gap'
    case 'payout_router_funding_pool':
      return 'Payout router funding pool'
    case 'payout_router_allocator':
      return 'Payout router allocator'
    case 'payout_router_accepted_token':
      return 'Payout router accepted token'
    case 'payout_router_min_repayment':
      return 'Payout router min repayment'
    case 'multisig_add_signers':
      return 'Add multisig owner'
    case 'multisig_remove_signers':
      return 'Remove multisig owner'
    case 'multisig_set_threshold':
      return 'Change multisig threshold'
    case 'multisig_signer_rotation':
      return 'Rotate multisig owners'
    case 'unknown':
      return 'Governance proposal'
    default:
      return 'Governance proposal'
  }
}

export function requestGovernancePillVariant(
  governanceStatus: string,
  pendingProposalId: string | null,
): AdminPillVariant {
  if (pendingProposalId || governanceStatus === 'pending_signatures') return 'underReview'
  if (governanceStatus === 'ready') return 'underReview'
  if (governanceStatus === 'failed') return 'rejected'
  return 'pending'
}

export function requestGovernanceStatusLabel(
  governanceStatus: string,
  pendingProposalId: string | null,
): string {
  if (pendingProposalId || governanceStatus === 'pending_signatures') return 'Pending governance'
  if (governanceStatus === 'ready') return 'Ready to execute'
  if (governanceStatus === 'failed') return 'Governance failed'
  return ''
}
