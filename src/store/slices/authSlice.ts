import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { sanitizeAccessToken, sanitizeRefreshToken } from '@/auth/accessTokenPolicy'
import { parseUserRole } from '@/utils/userRole'

export type UserRole = 'investor' | 'merchant'

/** `admin` = staff dashboard; `app` = investor/merchant wallet session. */
export type SessionKind = 'admin' | 'app' | null

export type AuthUser = {
  id?: string
  email?: string
}

export type SessionState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  onboarded: boolean
  /** `null` until the user picks a role on choose-role (also cleared on onboarding URL / role mismatch). */
  role: UserRole | null
  sessionKind: SessionKind
  /** @deprecated Prefer kyc slice + selectIsKycVerified; kept for redux-persist migration */
  kycVerified: boolean
}

const DEFAULT_SESSION: SessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  onboarded: false,
  role: null,
  sessionKind: null,
  kycVerified: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: DEFAULT_SESSION,
  reducers: {
    hydrateAuth: (_state, action: PayloadAction<SessionState>) => ({
      ...action.payload,
      accessToken: sanitizeAccessToken(action.payload.accessToken),
      refreshToken: sanitizeRefreshToken(action.payload.refreshToken),
      role: parseUserRole(action.payload.role),
      sessionKind: action.payload.sessionKind ?? null,
    }),
    patchAuth: (state, action: PayloadAction<Partial<SessionState>>) => {
      if (action.payload.accessToken !== undefined) {
        state.accessToken = sanitizeAccessToken(action.payload.accessToken)
      }
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = sanitizeRefreshToken(action.payload.refreshToken)
      }
      if (action.payload.user !== undefined) state.user = action.payload.user
      if (action.payload.onboarded !== undefined) state.onboarded = action.payload.onboarded
      if (action.payload.role !== undefined) state.role = parseUserRole(action.payload.role)
      if (action.payload.sessionKind !== undefined) state.sessionKind = action.payload.sessionKind
      if (action.payload.kycVerified !== undefined) state.kycVerified = action.payload.kycVerified
    },
    resetAuth: () => DEFAULT_SESSION,
  },
})

export const { hydrateAuth, patchAuth, resetAuth } = authSlice.actions
export const authReducer = authSlice.reducer
