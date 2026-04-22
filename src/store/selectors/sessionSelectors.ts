import type { RootState } from '@/store'

/** True only when KYC slice reports verified (single source of truth). */
export function selectIsKycVerified(state: RootState): boolean {
  return state.kyc.status === 'verified'
}

export function selectKycStatus(state: RootState) {
  return state.kyc.status
}

export function selectHasDashboardSession(state: RootState): boolean {
  return (
    state.auth.onboarded &&
    Boolean(state.auth.accessToken?.length) &&
    state.wallet.isConnected &&
    Boolean(state.wallet.address)
  )
}

/** True once redux-persist has rehydrated slices that drive route guards. */
export function selectIsPersistReady(state: RootState): boolean {
  const authReady = Boolean((state.auth as unknown as { _persist?: { rehydrated?: boolean } })._persist?.rehydrated)
  const onboardingReady = Boolean(
    (state.onboarding as unknown as { _persist?: { rehydrated?: boolean } })._persist?.rehydrated,
  )
  const kycReady = Boolean((state.kyc as unknown as { _persist?: { rehydrated?: boolean } })._persist?.rehydrated)
  return authReady && onboardingReady && kycReady
}
