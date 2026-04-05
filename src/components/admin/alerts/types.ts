export type AlertModalDetail =
  | {
      kind: 'loan-default'
      receivableId: string
      subtitle: string
      merchantName: string
      receivableName: string
      invoiceAmount: string
      statusLine: string
    }
  | {
      kind: 'late-repayment'
      receivableId: string
      subtitle: string
      merchantName: string
      receivableName: string
      invoiceAmount: string
      statusLine: string
    }
  | {
      kind: 'large-withdrawal'
      subtitle: string
      investorName: string
      walletAddress: string
      withdrawalAmount: string
      statusLine: string
    }

export type LoanDefaultDetail = Extract<AlertModalDetail, { kind: 'loan-default' }>
export type LateRepaymentDetail = Extract<AlertModalDetail, { kind: 'late-repayment' }>
export type LargeWithdrawalDetail = Extract<AlertModalDetail, { kind: 'large-withdrawal' }>

export type AdminAlertDetailRow = {
  label: string
  value: string
  valueClassName?: string
}

export type AdminAlertBackRowProps = {
  onBack: () => void
}

export type AdminAlertDetailRowsProps = {
  rows: AdminAlertDetailRow[]
}

export type AdminLoanDefaultModalProps = {
  detail: LoanDefaultDetail
  onClose: () => void
}

export type AdminLateRepaymentModalProps = {
  detail: LateRepaymentDetail
  onClose: () => void
}

export type AdminLargeWithdrawalModalProps = {
  detail: LargeWithdrawalDetail
  onClose: () => void
}

export type AdminAlertModalRouterProps = {
  detail: AlertModalDetail | null
  onClose: () => void
}
