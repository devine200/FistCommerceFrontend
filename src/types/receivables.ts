export enum ReceivableStage {
  Created = 'CREATED',
  Verified = 'VERIFIED',
  Funded = 'FUNDED',
  Matured = 'MATURED',
  Defaulted = 'DEFAULTED',
  Repaid = 'REPAID',
}

export function isReceivableVerified(stage: ReceivableStage) {
  return stage !== ReceivableStage.Created
}

export function lifecycleCompletedCount(stage: ReceivableStage) {
  switch (stage) {
    case ReceivableStage.Created:
      return 1
    case ReceivableStage.Verified:
      return 2
    case ReceivableStage.Funded:
      return 3
    case ReceivableStage.Matured:
      return 4
    case ReceivableStage.Defaulted:
      return 5
    case ReceivableStage.Repaid:
      return 6
    default:
      return 1
  }
}

/** Lifecycle step indices aligned with `receivableDetailConfig` demo steps. */
export const RECEIVABLE_LIFECYCLE_STEP = {
  Created: 0,
  Verified: 1,
  Funded: 2,
  Matured: 3,
  Defaulted: 4,
  Repaid: 5,
} as const

/** Whether a lifecycle row should render as completed for the given receivable stage. */
export function isLifecycleStepCompleted(stage: ReceivableStage, stepIndex: number): boolean {
  switch (stage) {
    case ReceivableStage.Created:
      return stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Created
    case ReceivableStage.Verified:
      return stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Verified
    case ReceivableStage.Funded:
      return stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Funded
    case ReceivableStage.Matured:
      return stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Matured
    case ReceivableStage.Defaulted:
      return stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Defaulted
    case ReceivableStage.Repaid:
      // Repaid loans complete through maturity and the repaid step, not the default branch.
      if (stepIndex === RECEIVABLE_LIFECYCLE_STEP.Defaulted) return false
      return (
        stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Matured || stepIndex === RECEIVABLE_LIFECYCLE_STEP.Repaid
      )
    default:
      return stepIndex <= RECEIVABLE_LIFECYCLE_STEP.Created
  }
}

/** Repayment is allowed after disbursement to the merchant (paid out or later, but not if fully repaid). */
export function isReceivableStageEligibleForRepayment(stage: ReceivableStage): boolean {
  return stage === ReceivableStage.Matured || stage === ReceivableStage.Defaulted
}

