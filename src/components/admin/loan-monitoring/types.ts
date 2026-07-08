import type { ReceivableLifecycleStep } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'

export type LoanMonitoringFieldRow = {
  label: string
  value: string
}

export type LoanMonitoringAdminActions = {
  canApprove: boolean
  canReject: boolean
  /** Step 1 — allocate pool capital (`POST /api/loan/admin/fund`). */
  canFund: boolean
  /** Step 2 — disburse to merchant (`POST /api/payout/initiate/`). */
  canInitiatePayout: boolean
  canMarkDefaulted: boolean
  canWriteOffShortfall: boolean
  uiStatus: string
}

export type LoanMonitoringDefaultManagement = {
  title: string
  description: string
  canMarkDefaulted: boolean
  buttonLabel: string
}

export type LoanMonitoringDetailView = {
  loanId: string
  receivableName: string
  receivableId: string | null
  /** On-chain loan lifecycle (`created`, `verified`, `funded`, `paid_out`, …). */
  loanLifecycleStatus: string
  /** Pool capital allocated (`funded` or later). */
  fundingApprovalDone: boolean
  /** ERC20 disbursed to merchant (`paid_out` / `is_paid_out`). */
  isPaidOut: boolean
  showFundingApprovalSection: boolean
  showFundingPayoutSection: boolean
  canApproveFunding: boolean
  canInitiatePayout: boolean
  basicInfo: LoanMonitoringFieldRow[]
  documentName: string
  documentUrl: string | null
  lifecycle: ReceivableLifecycleStep[]
  lifecycleCompletedCount: number
  repaymentRows: LoanMonitoringFieldRow[]
  maturityBanner: string
  defaultManagement: LoanMonitoringDefaultManagement
  admin: LoanMonitoringAdminActions
}

export type AdminLoanMonitoringActionKind =
  | 'approve'
  | 'reject'
  | 'fund'
  | 'initiatePayout'
  | 'markDefaulted'
  | 'writeOffShortfall'
