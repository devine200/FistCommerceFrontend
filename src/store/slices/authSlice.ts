import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'investor' | 'merchant'

export type SessionState = {
  onboarded: boolean
  role: UserRole
  kycVerified: boolean
}

const DEFAULT_SESSION: SessionState = {
  onboarded: false,
  role: 'investor',
  kycVerified: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: DEFAULT_SESSION,
  reducers: {
    hydrateAuth: (_state, action: PayloadAction<SessionState>) => action.payload,
    patchAuth: (state, action: PayloadAction<Partial<SessionState>>) => {
      if (action.payload.onboarded !== undefined) state.onboarded = action.payload.onboarded
      if (action.payload.role !== undefined) state.role = action.payload.role
      if (action.payload.kycVerified !== undefined) state.kycVerified = action.payload.kycVerified
    },
  },
})

export const { hydrateAuth, patchAuth } = authSlice.actions
export const authReducer = authSlice.reducer
