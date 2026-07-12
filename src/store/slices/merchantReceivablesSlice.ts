import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { fetchMerchantLoanList, type MerchantLoanListEntry } from '@/api/loanDetails'
import { recordSessionDiagnostic } from '@/session/sessionDiagnostics'
import type { RootState } from '@/store'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'

export type MerchantReceivablesStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MerchantReceivablesState = {
  loans: MerchantLoanListEntry[]
  status: MerchantReceivablesStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: MerchantReceivablesState = {
  loans: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
}

export const refreshMerchantReceivables = createAsyncThunk(
  'merchantReceivables/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as RootState
    const accessToken = state.auth?.accessToken?.trim()
    if (!accessToken) {
      return { fetchedAt: Date.now(), loans: [] as MerchantLoanListEntry[] }
    }

    // Only fully verified merchants (reviewed + kyc_verified + insurance_verified) may call GET /api/loan/request.
    if (!selectIsKycVerified(state)) {
      recordSessionDiagnostic({
        event: 'loan_request_skipped',
        note: 'skipped GET /api/loan/request — merchant not fully verified',
        role: state.auth.role,
        hasAccessToken: true,
      })
      return { fetchedAt: Date.now(), loans: [] as MerchantLoanListEntry[] }
    }

    const loans = await fetchMerchantLoanList(accessToken)
    return { fetchedAt: Date.now(), loans }
  },
)

const merchantReceivablesSlice = createSlice({
  name: 'merchantReceivables',
  initialState,
  reducers: {
    clearMerchantReceivables: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMerchantReceivables.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshMerchantReceivables.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.loans = action.payload.loans
        state.lastUpdated = action.payload.fetchedAt
      })
      .addCase(refreshMerchantReceivables.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Could not load receivables.'
      })
  },
})

export const { clearMerchantReceivables } = merchantReceivablesSlice.actions
export const merchantReceivablesReducer = merchantReceivablesSlice.reducer
