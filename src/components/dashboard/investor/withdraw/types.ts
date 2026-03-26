export enum WithdrawalStep {
  AmountEntry = 'amount-entry',
  MethodConfirmation = 'method-confirmation',
  FinalConfirmation = 'final-confirmation',
  WithdrawalCompleted = 'withdrawal-completed',
}

export type WithdrawalSource = 'principal' | 'earnings'

export type WithdrawalSourceCard = {
  key: WithdrawalSource
  label: string
  value: string
}

export type WithdrawalReviewRow = {
  label: string
  value: string
  valueTone?: 'default' | 'primary'
}

export type WithdrawalCompletedMetric = {
  label: string
  value: string
}
