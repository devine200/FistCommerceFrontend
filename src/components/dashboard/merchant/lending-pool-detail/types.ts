export type MerchantLoanTableRowData = {
  id: string
  merchantName: string
  /** Truncated wallet / id shown in blue under name */
  walletShort: string
  loanAmount: string
  issueDate: string
  repaymentDue: string
  repaymentAmount: string
  /** Shown under repayment amount, e.g. "4.3% APY" */
  repaymentApy?: string
  debtStatus: string
}

export type LendingPoolDetailConfig = {
  title: string
  subtitle: string
  stats: { label: string; value: string; hint?: string }[]
  /** Multi-paragraph overview (justified body) */
  overviewParagraphs?: string[]
  financialInfoRows: { label: string; value: string }[]
  termsForLoanRows: { label: string; value: string }[]
  loans: MerchantLoanTableRowData[]
}

export type MerchantLoanDetailExtended = MerchantLoanTableRowData & {
  documentsNote?: string
  purpose?: string
  collateral?: string
}
