import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { fetchAdminServicerWallet, type AdminServicerWallet } from '@/api/adminServicerWallet'
import { ApiRequestError } from '@/api/client'

export type AdminServicerWalletSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AdminServicerWalletState = {
  wallet: AdminServicerWallet | null
  status: AdminServicerWalletSyncStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: AdminServicerWalletState = {
  wallet: null,
  status: 'idle',
  error: null,
  lastUpdated: null,
}

type AuthSlice = { auth?: { accessToken?: string | null } }

export const refreshAdminServicerWallet = createAsyncThunk(
  'adminServicerWallet/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to load servicer wallet.')
    try {
      const wallet = await fetchAdminServicerWallet(accessToken)
      return { wallet, fetchedAt: Date.now() }
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(e.message)
      throw e
    }
  },
)

const adminServicerWalletSlice = createSlice({
  name: 'adminServicerWallet',
  initialState,
  reducers: {
    resetAdminServicerWallet: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminServicerWallet.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshAdminServicerWallet.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.wallet = action.payload.wallet
        state.lastUpdated = action.payload.fetchedAt
      })
      .addCase(refreshAdminServicerWallet.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load servicer wallet.'
      })
  },
})

export const { resetAdminServicerWallet } = adminServicerWalletSlice.actions
export const adminServicerWalletReducer = adminServicerWalletSlice.reducer
