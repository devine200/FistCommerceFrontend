import type { KycStatus } from '@/store/slices/kycSlice'
import type { SessionKind, UserRole } from '@/store/slices/authSlice'

export type AccessDecision = {
  allowed: boolean
  /** When not allowed, navigate here (path only, existing routes) */
  redirectTo: string | null
  reason:
    | 'ok'
    | 'no_wallet'
    | 'no_token'
    | 'not_onboarded'
    | 'kyc_required'
    | 'onboarding_step'
    | 'role_mismatch'
    | 'admin_required'
    | 'admin_session_only'
    | 'session_expired'
}

export type AccessContext = {
  pathname: string
  /** True once redux-persist finished rehydrating slices used by guards. */
  persistedReady: boolean
  privyReady: boolean
  walletsReady: boolean
  role: UserRole | null
  onboarded: boolean
  accessToken: string | null
  sessionKind: SessionKind
  /** True after API refresh failure until user chooses Log in again or Log out. */
  sessionExpired: boolean
  /** Wallet connection status (used by access guards). */
  walletStatus: string
  walletConnected: boolean
  walletAddress: string | null
  kycStatus: KycStatus
  /** Role-aware: investor `reviewed` + `kyc_verified`; merchant both verifications (matches financial route gates). */
  kycFinancialAccess: boolean
  /** For onboarding URL guard */
  onboardingMaxStep: { investor: number; merchant: number }
  /** Step indices with unsaved form edits (blocks jumping forward by URL). */
  onboardingStepDirty: { investor: Record<string, boolean>; merchant: Record<string, boolean> }
}

export type AccessCapabilities = {
  canUseInvestActions: boolean
  canUseMerchantLoanActions: boolean
  canUseMerchantRepayActions: boolean
}
