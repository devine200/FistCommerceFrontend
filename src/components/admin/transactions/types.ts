export type AdminTxModalStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected'

export type AdminTransactionFlow = 'out' | 'in' | 'neutral'

export type AdminTransactionDetail = {
  summaryLabel: string
  amountDisplay: string
  flow: AdminTransactionFlow
  partyLabel: string
  partyName: string
  transactionId: string
  dateTime: string
  transactionType: string
  status: AdminTxModalStatus
  transactionAmount: string
  feesDeducted: string
  netReceived: string
  walletAddress: string
  network: string
}

export type AdminTransactionDetailsModalProps = {
  detail: AdminTransactionDetail | null
  onClose: () => void
}

export type AdminTransactionDetailRow = {
  label: string
  value: string
  valueClassName?: string
}

export type AdminTransactionFlowIconProps = {
  flow: AdminTransactionFlow
}

export type AdminTransactionModalDetailRowsProps = {
  detail: AdminTransactionDetail
}
