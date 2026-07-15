import { shouldRedirectToAdminLogin } from '@/auth/adminSession'
import type { AppDispatch } from '@/store'
import { patchAuth, type UserRole } from '@/store/slices/authSlice'
import { unlockOnboardingStep } from '@/store/slices/onboardingSlice'
import { parseUserRole } from '@/utils/userRole'

import { resetUserSession } from '@/session/resetUserSession'

const SESSION_END_STORAGE_KEY = 'fistcommerce.sessionEndMessage'

export type SessionEndReason =
  | 'refresh_expired'
  | 'refresh_failed'
  | 'missing_refresh'
  | 'header_too_large'
  | 'wallet_disconnected'
  | 'wallet_changed'
  | 'privy_logout'

type SessionEndPayload = {
  reason: SessionEndReason
  role: UserRole | null
}

const SESSION_END_MESSAGES: Record<SessionEndReason, string> = {
  refresh_expired: 'Your session expired. Sign in again with your wallet to continue.',
  refresh_failed: 'Your session could not be renewed. Sign in again with your wallet to continue.',
  missing_refresh: 'Your session is no longer valid. Sign in again with your wallet to continue.',
  header_too_large: 'Your saved session was corrupted. Sign in again with your wallet to continue.',
  wallet_disconnected: 'Your wallet disconnected. Reconnect and sign in again to continue.',
  wallet_changed: 'Wallet changed. Sign in again with the new wallet to continue.',
  privy_logout: 'You were signed out. Sign in again with your wallet to continue.',
}

export function stashSessionEndMessage(reason: SessionEndReason, role: UserRole | null = null): void {
  if (typeof window === 'undefined') return
  try {
    const payload: SessionEndPayload = { reason, role }
    window.sessionStorage.setItem(SESSION_END_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Read and clear a pending session-end message (for connect-wallet UI). */
export function consumeSessionEndMessage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_END_STORAGE_KEY)
    if (!raw) return null
    window.sessionStorage.removeItem(SESSION_END_STORAGE_KEY)
    const parsed = JSON.parse(raw) as Partial<SessionEndPayload>
    const reason = parsed.reason
    if (!reason || !(reason in SESSION_END_MESSAGES)) return null
    return SESSION_END_MESSAGES[reason as SessionEndReason]
  } catch {
    try {
      window.sessionStorage.removeItem(SESSION_END_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}

function connectWalletPathForRole(role: UserRole | null): string {
  if (role === 'investor' || role === 'merchant') {
    return `/onboarding/${role}/connect-wallet`
  }
  return '/onboarding/choose-role'
}

let sessionEndInFlight: Promise<void> | null = null

/**
 * Ends an investor/merchant app session with a user-visible reason, keeps role when known,
 * and lands on the matching connect-wallet step (not a silent choose-role bounce).
 */
export async function endAppSessionAndRedirect(
  dispatch: AppDispatch,
  options: {
    reason: SessionEndReason
    accessToken?: string | null
    sessionKind?: import('@/store/slices/authSlice').SessionKind
    role?: string | null
    /** Prefer keeping the user’s onboarding branch so they don’t re-pick role. */
    keepRole?: boolean
  },
): Promise<void> {
  if (sessionEndInFlight) return sessionEndInFlight

  sessionEndInFlight = (async () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : undefined
    if (
      shouldRedirectToAdminLogin({
        accessToken: options.accessToken,
        sessionKind: options.sessionKind,
        pathname,
      })
    ) {
      const { logoutAdminSession } = await import('@/session/logoutAdminSession')
      await logoutAdminSession(dispatch)
      return
    }

    const role = parseUserRole(options.role)
    stashSessionEndMessage(options.reason, role)

    resetUserSession(dispatch)
    if (options.keepRole !== false && role) {
      dispatch(patchAuth({ role }))
      // resetOnboardingProgress leaves maxStep at 0; unlock connect-wallet so guards
      // do not bounce to choose-role after a wallet/session end.
      dispatch(unlockOnboardingStep({ role, stepIndex: 1 }))
    }

    const { persistor } = await import('@/store')
    await persistor.flush()

    const path = connectWalletPathForRole(options.keepRole === false ? null : role)
    window.location.assign(path)
  })().finally(() => {
    sessionEndInFlight = null
  })

  return sessionEndInFlight
}
