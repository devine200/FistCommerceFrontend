import type { UserRole } from '@/store/slices/authSlice'

/** Accepts only `investor` / `merchant`; returns `null` for anything else (garbage persisted state, API typos). */
export function parseUserRole(value: unknown): UserRole | null {
  if (value === 'investor' || value === 'merchant') return value
  return null
}

export function dashboardOverviewPath(role: UserRole): string {
  return `/dashboard/${role}/overview`
}

/** Primary dashboard landing path: opportunities once KYC is verified, otherwise overview. */
export function dashboardHomePath(role: UserRole, isKycVerified = false): string {
  return `/dashboard/${role}/${isKycVerified ? 'opportunities' : 'overview'}`
}
