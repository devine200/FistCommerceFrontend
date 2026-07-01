import type { AdminLoanMonitoringActionKind } from '@/components/admin/loan-monitoring/types'

export function loanMonitoringPrivilegedActionLabels(kind: AdminLoanMonitoringActionKind | null) {
  switch (kind) {
    case 'approve':
      return {
        loadingTitle: 'Approving loan',
        loadingDescription: 'Submitting loan approval. This may create a governance proposal…',
        errorTitle: 'Unable to approve loan',
        directSuccessTitle: 'Loan approved',
      }
    case 'reject':
      return {
        loadingTitle: 'Rejecting loan',
        loadingDescription: 'Submitting loan rejection…',
        errorTitle: 'Unable to reject loan',
        directSuccessTitle: 'Loan rejected',
      }
    case 'fund':
      return {
        loadingTitle: 'Releasing funds',
        loadingDescription: 'Submitting fund release. This may create a governance proposal…',
        errorTitle: 'Unable to release funds',
        directSuccessTitle: 'Funds released',
      }
    case 'markDefaulted':
      return {
        loadingTitle: 'Marking loan as defaulted',
        loadingDescription: 'Submitting default status. This may create a governance proposal…',
        errorTitle: 'Unable to mark loan as defaulted',
        directSuccessTitle: 'Loan marked as defaulted',
      }
    case 'writeOffShortfall':
      return {
        loadingTitle: 'Writing off shortfall',
        loadingDescription: 'Submitting shortfall write-off. This may create a governance proposal…',
        errorTitle: 'Unable to write off shortfall',
        directSuccessTitle: 'Shortfall written off',
      }
    default:
      return {
        loadingTitle: 'Processing action',
        loadingDescription: 'Submitting your request…',
        errorTitle: 'Unable to complete action',
        directSuccessTitle: 'Action completed',
      }
  }
}
