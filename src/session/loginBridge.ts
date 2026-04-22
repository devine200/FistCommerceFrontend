import type { AppDispatch } from '@/store'
import { patchAuth } from '@/store/slices/authSlice'
import { setKycStatus, type KycStatus } from '@/store/slices/kycSlice'
import { unlockAllOnboardingSteps } from '@/store/slices/onboardingSlice'
import type { UserRole } from '@/store/slices/authSlice'

/**
 * Session fields returned from `POST /auth/login` (and similar profile payloads).
 * See `AuthLoginResponseBody` / `WalletLoginResult` in `@/api/walletSession`.
 */
export type WalletProfileLoginResponse = {
  access_token: string
  refresh_token?: string | null
  /** Mirrors login `has_registered_profile` — user may skip registration steps. */
  registered: boolean
  onboarded: boolean
  kycStatus: KycStatus
  user?: { id?: string; email?: string }
  role?: UserRole
}

export type ApplyWalletLoginOptions = {
  /** When the login JSON omits `role`, use the role from the onboarding branch (choose-role). */
  fallbackRole?: UserRole
}

/**
 * Apply backend response after wallet-based login (returning users).
 * Call from your API layer when login succeeds.
 */
export function applyWalletLoginResponse(
  dispatch: AppDispatch,
  res: WalletProfileLoginResponse,
  options?: ApplyWalletLoginOptions,
) {
  const role = res.role ?? options?.fallbackRole ?? 'investor'
  const onboarded = Boolean(res.onboarded || res.registered)
  dispatch(
    patchAuth({
      accessToken: res.access_token,
      ...(res.refresh_token !== undefined ? { refreshToken: res.refresh_token } : {}),
      user: res.user ?? null,
      onboarded,
      role,
      kycVerified: res.kycStatus === 'verified',
    }),
  )
  dispatch(setKycStatus(res.kycStatus))
  if (onboarded) {
    dispatch(unlockAllOnboardingSteps(role))
  }
}
