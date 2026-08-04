export type GovernanceNonceWarningMode = 'sign_ahead' | 'queue_jump_execute'

export type GovernanceNonceConfirmPayload = {
  mode: GovernanceNonceWarningMode
  message: string
  blockingProposalIds: string[]
  willInvalidateOthers: boolean
  liveNonce?: number | null
  reservedNonce?: number | null
  requiresResign?: boolean
}
