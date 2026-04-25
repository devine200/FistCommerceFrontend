import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { fetchMerchantTransactions, type MerchantTransactionApi } from '@/api/metrics'

export type MerchantTransactionsStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MerchantTransactionsState = {
  items: MerchantTransactionApi[]
  status: MerchantTransactionsStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: MerchantTransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
}

export const refreshMerchantTransactions = createAsyncThunk(
  'merchantTransactions/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as { auth?: { accessToken?: string | null }; kyc?: { status?: string } }
    const accessToken = state.auth?.accessToken
    const isKycVerified = state.kyc?.status === 'verified'
    if (!isKycVerified) {
      return { fetchedAt: Date.now(), transactions: [] }
    }
    const transactions = await fetchMerchantTransactions(accessToken)
    return { fetchedAt: Date.now(), transactions }
  },
)

const merchantTransactionsSlice = createSlice({
  name: 'merchantTransactions',
  initialState,
  reducers: {
    clearMerchantTransactions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMerchantTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshMerchantTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.transactions
        state.lastUpdated = action.payload.fetchedAt
      })
      .addCase(refreshMerchantTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Could not load merchant transactions.'
      })
  },
})

export const { clearMerchantTransactions } = merchantTransactionsSlice.actions
export const merchantTransactionsReducer = merchantTransactionsSlice.reducer

