import type { RootState } from '@/store'

/**
 * Dashboard / financial access: investor when `kyc_verified`; merchant when both identity and insurance verified.
 * Falls back to `kyc.status === 'verified'` when the GET snapshot is not yet hydrated.
 */
export function selectIsKycVerified(state: RootState): boolean {
  const st = state.kyc.status
  if (st === 'rejected') return false
  if (st === 'verified') return true
  const role = state.auth.role
  if (role === 'investor') {
    return Boolean(state.kyc.investorKycRecord?.kyc_verified)
  }
  if (role === 'merchant') {
    const m = state.kyc.merchantKycRecord
    return Boolean(m?.kyc_verified && m?.insurance_verified)
  }
  return false
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
  return authReady && onboardingReady
}
