import type { AppDispatch } from '@/store'
import { resetAuth } from '@/store/slices/authSlice'
import { resetKyc } from '@/store/slices/kycSlice'
import { resetOnboardingProgress } from '@/store/slices/onboardingSlice'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'
import { resetWallet } from '@/store/slices/walletSlice'

const ACTIVE_WALLET_STORAGE_KEY = 'fistcommerce.activeWalletId'

/** Clears auth, wallet mirror, onboarding progress, and KYC (e.g. wallet disconnect). */
export function resetUserSession(dispatch: AppDispatch) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_WALLET_STORAGE_KEY)
    }
  } catch {
    // ignore (storage disabled)
  }
  dispatch(resetAuth())
  dispatch(resetWallet())
  dispatch(resetOnboardingProgress())
  dispatch(resetOnboardingProfileDrafts())
  dispatch(resetKyc())
}
