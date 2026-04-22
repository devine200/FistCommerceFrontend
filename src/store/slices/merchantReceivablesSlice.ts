import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { fetchMerchantLoans, type MerchantLoanApi } from '@/api/loans'
import { displayDashboardMetricString } from '@/api/metrics'
import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'

export type MerchantReceivablesStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MerchantReceivablesState = {
  loans: MerchantLoanApi[]
  rows: ReceivableTableRow[]
  status: MerchantReceivablesStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: MerchantReceivablesState = {
  loans: [],
  rows: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
}

function parseLoanAmountToUsd(loanAmount: string): string {
  // Swagger returns a string; treat as money-like and format for UI.
  return displayDashboardMetricString(loanAmount)
}

function statusToDebtStatusVariant(statusRaw: string): {
  debtStatus: string
  debtStatusVariant: ReceivableTableRow['debtStatusVariant']
} {
  const s = (statusRaw ?? '').trim().toLowerCase()
  if (!s) return { debtStatus: '—', debtStatusVariant: 'unpaid' }
  if (s.includes('repaid') || s.includes('paid') || s === 'completed')
    return { debtStatus: 'Repaid', debtStatusVariant: 'repaid' }
  if (s.includes('default')) return { debtStatus: 'Defaulted', debtStatusVariant: 'defaulted' }
  return { debtStatus: 'Unpaid', debtStatusVariant: 'unpaid' }
}

function loanToReceivableRow(loan: MerchantLoanApi): ReceivableTableRow {
  const loanAmount = parseLoanAmountToUsd(loan.loan_amount)
  const status = statusToDebtStatusVariant(loan.status)

  return {
    id: loan.id,
    receivableName: `Receivable ${loan.id.slice(0, 8)}`,
    loanAmount,
    apr: '—',
    repaymentDue: '—',
    repaymentDueVariant: 'upcoming',
    repaymentAmount: '—',
    interestSubline: '',
    debtStatus: status.debtStatus,
    debtStatusVariant: status.debtStatusVariant,
    rowEmphasis: status.debtStatusVariant === 'defaulted',
  }
}

export const refreshMerchantReceivables = createAsyncThunk(
  'merchantReceivables/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as { auth?: { accessToken?: string | null } }
    const accessToken = state.auth?.accessToken
    const loans = await fetchMerchantLoans(accessToken)
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
        state.rows = action.payload.loans.map(loanToReceivableRow)
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

