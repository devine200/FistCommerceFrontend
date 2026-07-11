import type { AppDispatch } from '@/store'
import { resetAuth } from '@/store/slices/authSlice'
import { resetKyc } from '@/store/slices/kycSlice'
import { resetOnboardingProgress } from '@/store/slices/onboardingSlice'
import { resetOnboardingProfileDrafts } from '@/store/slices/onboardingProfileDraftSlice'
import { resetWallet } from '@/store/slices/walletSlice'
import { clearStoredActiveWalletId } from '@/session/disconnectPrivySession'

/** Clears auth, wallet mirror, onboarding progress, and KYC (e.g. wallet disconnect). */
export function resetUserSession(dispatch: AppDispatch) {
  clearStoredActiveWalletId()
  dispatch(resetAuth())
  dispatch(resetWallet())
  dispatch(resetOnboardingProgress())
  dispatch(resetOnboardingProfileDrafts())
  dispatch(resetKyc())
}
