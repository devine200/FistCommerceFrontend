import { isMerchantFullyVerified } from '@/api/kycMerchant'
import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'
import type { RootState } from '@/store'

import { parseUserRole } from '@/utils/userRole'

/**
 * Dashboard / financial access:
 * - investor: `reviewed` and `kyc_verified`
 * - merchant: `reviewed`, `kyc_verified`, and `insurance_verified`
 * Falls back to `kyc.status === 'verified'` when the GET snapshot is not yet hydrated.
 */
export function selectIsKycVerified(state: RootState): boolean {
  const st = state.kyc.status
  if (st === 'rejected') return false
  if (st === 'verified') return true
  const role = parseUserRole(state.auth.role)
  if (role === 'investor') {
    const r = state.kyc.investorKycRecord
    return Boolean(r?.reviewed && r?.kyc_verified)
  }
  if (role === 'merchant') {
    return isMerchantFullyVerified(state.kyc.merchantKycRecord)
  }
  return false
}

export function selectKycStatus(state: RootState) {
  return state.kyc.status
}

export function selectHasDashboardSession(state: RootState): boolean {
  return (
    !state.auth.sessionExpired &&
    state.auth.onboarded &&
    isUsableApiAccessToken(state.auth.accessToken) &&
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
