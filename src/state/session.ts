export type UserRole = 'investor' | 'merchant'

export type SessionState = {
  /** Whether user has completed onboarding (dummy "logged in" flag) */
  onboarded: boolean
  /** Current selected role for routing */
  role: UserRole
  /** Whether KYC is verified (dummy flag toggled by KYC completion) */
  kycVerified: boolean
}

// Bump this to reset persisted demo session/KYC state.
const STORAGE_KEY = 'fistcommerce.session.v2'

const DEFAULT_SESSION: SessionState = {
  onboarded: false,
  role: 'investor',
  kycVerified: false,
}

export function getSession(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SESSION
    const parsed = JSON.parse(raw) as Partial<SessionState>
    return {
      onboarded: Boolean(parsed.onboarded),
      role: (parsed.role === 'merchant' ? 'merchant' : 'investor') as UserRole,
      kycVerified: Boolean(parsed.kycVerified),
    }
  } catch {
    return DEFAULT_SESSION
  }
}

export function setSession(next: Partial<SessionState>) {
  const current = getSession()
  const merged: SessionState = { ...current, ...next }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new Event('fistcommerce:session-change'))
}

export function setRole(role: UserRole) {
  setSession({ role })
}

export function completeOnboarding(role?: UserRole) {
  setSession({ onboarded: true, role: role ?? getSession().role })
}

export function setKycVerified(value: boolean) {
  setSession({ kycVerified: value })
}

