import type { AppDispatch } from '@/store'
import { patchAuth } from '@/store/slices/authSlice'
import { setKycStatus, type KycStatus } from '@/store/slices/kycSlice'
import { unlockAllOnboardingSteps } from '@/store/slices/onboardingSlice'
import type { SessionState, UserRole } from '@/store/slices/authSlice'
import { parseUserRole } from '@/utils/userRole'

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
  /** Session-bound chain from login (`chain_id`). */
  chain_id?: number | null
  /** Bare wallet from login when present. */
  wallet?: string | null
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
  const role = parseUserRole(res.role) ?? parseUserRole(options?.fallbackRole) ?? 'investor'
  const onboarded = Boolean(res.onboarded || res.registered)
  const authPatch: Partial<SessionState> = {
    accessToken: res.access_token,
    user: res.user ?? null,
    onboarded,
    role,
    sessionKind: 'app',
    sessionExpired: false,
    sessionExpiredReason: null,
    kycVerified: res.kycStatus === 'verified',
  }
  if ('refresh_token' in res) {
    authPatch.refreshToken = res.refresh_token ?? null
  }
  if (typeof res.chain_id === 'number' && Number.isFinite(res.chain_id)) {
    authPatch.chainId = Math.trunc(res.chain_id)
  }
  if (typeof res.wallet === 'string' && res.wallet.trim()) {
    authPatch.wallet = res.wallet.trim()
  }
  dispatch(patchAuth(authPatch))
  dispatch(setKycStatus(res.kycStatus))
  if (onboarded) {
    dispatch(unlockAllOnboardingSteps(role))
  }
}
