export enum WithdrawalStep {
  AmountEntry = 'amount-entry',
  MethodConfirmation = 'method-confirmation',
  FinalConfirmation = 'final-confirmation',
  WithdrawalCompleted = 'withdrawal-completed',
  FlowFailure = 'flow-failure',
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
