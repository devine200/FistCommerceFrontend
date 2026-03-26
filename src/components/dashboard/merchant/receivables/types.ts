export type ReceivableSummaryIcon = 'money' | 'dollar'

export type ReceivableSummaryCard = {
  id: string
  icon: ReceivableSummaryIcon
  title: string
  primaryValue: string
  secondaryValue: string
}

export type RepaymentDueVariant = 'upcoming' | 'overdue' | 'repaid'

export type DebtStatusVariant = 'unpaid' | 'defaulted' | 'repaid'

export type ReceivableTableRow = {
  id: string
  receivableName: string
  loanAmount: string
  apr: string
  repaymentDue: string
  repaymentDueVariant: RepaymentDueVariant
  repaymentAmount: string
  interestSubline?: string
  debtStatus: string
  debtStatusVariant: DebtStatusVariant
  rowEmphasis: boolean
}
