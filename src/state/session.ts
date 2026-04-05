import { store } from '@/store'
import { patchAuth, type SessionState, type UserRole } from '@/store/slices/authSlice'

export type { UserRole, SessionState }

export function getSession(): SessionState {
  return store.getState().auth
}

export function setSession(next: Partial<SessionState>) {
  store.dispatch(patchAuth(next))
}

export function setRole(role: UserRole) {
  store.dispatch(patchAuth({ role }))
}

export function completeOnboarding(role?: UserRole) {
  const current = store.getState().auth
  store.dispatch(patchAuth({ onboarded: true, role: role ?? current.role }))
}

export function setKycVerified(value: boolean) {
  store.dispatch(patchAuth({ kycVerified: value }))
}
