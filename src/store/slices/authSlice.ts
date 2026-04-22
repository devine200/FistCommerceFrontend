import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'investor' | 'merchant'

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
  /** @deprecated Prefer kyc slice + selectIsKycVerified; kept for redux-persist migration */
  kycVerified: boolean
}

const DEFAULT_SESSION: SessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  onboarded: false,
  role: null,
  kycVerified: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: DEFAULT_SESSION,
  reducers: {
    hydrateAuth: (_state, action: PayloadAction<SessionState>) => action.payload,
    patchAuth: (state, action: PayloadAction<Partial<SessionState>>) => {
      if (action.payload.accessToken !== undefined) state.accessToken = action.payload.accessToken
      if (action.payload.refreshToken !== undefined) state.refreshToken = action.payload.refreshToken
      if (action.payload.user !== undefined) state.user = action.payload.user
      if (action.payload.onboarded !== undefined) state.onboarded = action.payload.onboarded
      if (action.payload.role !== undefined) state.role = action.payload.role
      if (action.payload.kycVerified !== undefined) state.kycVerified = action.payload.kycVerified
    },
    resetAuth: () => DEFAULT_SESSION,
  },
})

export const { hydrateAuth, patchAuth, resetAuth } = authSlice.actions
export const authReducer = authSlice.reducer
