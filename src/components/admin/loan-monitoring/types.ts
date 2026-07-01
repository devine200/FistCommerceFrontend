import type { ReceivableLifecycleStep } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'

export type LoanMonitoringFieldRow = {
  label: string
  value: string
}

export type LoanMonitoringAdminActions = {
  canApprove: boolean
  canReject: boolean
  canFund: boolean
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
  | 'markDefaulted'
  | 'writeOffShortfall'
