export enum ReceivableStage {
  Created = 'CREATED',
  Verified = 'VERIFIED',
  Funded = 'FUNDED',
  Matured = 'MATURED',
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
    case ReceivableStage.Repaid:
      return 5
    default:
      return 1
  }
}

