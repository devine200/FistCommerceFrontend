import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { LendingPoolCardState } from '@/store/slices/investorDashboardSlice'

export type MerchantDashboardSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MerchantDashboardState = {
  walletDisplay: string
  totalDepositsDisplay: string
  lendingPools: LendingPoolCardState[]
  status: MerchantDashboardSyncStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: MerchantDashboardState = {
  walletDisplay: '0x7A3F...92C1',
  totalDepositsDisplay: '538,500',
  lendingPools: [
    {
      id: 'fist-commerce-lending-pool',
      viewDetailsTo: '/dashboard/merchant/lending-pool/fist-commerce-lending-pool',
      poolTitle: 'Fist Commerce Lending Pool',
      tagline: 'For short-duration loans with stable returns.',
      apyDisplay: '6-8% APY',
      tvlDisplay: '538,500 USDC',
      minDepositDisplay: '100 USDC',
      utilizationDisplay: '60% Allocated',
    },
  ],
  status: 'idle',
  error: null,
  lastUpdated: null,
}

export const refreshMerchantDashboard = createAsyncThunk('merchantDashboard/refresh', async () => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 400)
  })
  return { refreshedAt: Date.now() }
})

const merchantDashboardSlice = createSlice({
  name: 'merchantDashboard',
  initialState,
  reducers: {
    setMerchantWalletDisplay: (state, action: PayloadAction<string>) => {
      state.walletDisplay = action.payload
    },
    setMerchantTotalDepositsDisplay: (state, action: PayloadAction<string>) => {
      state.totalDepositsDisplay = action.payload
    },
    setMerchantLendingPools: (state, action: PayloadAction<LendingPoolCardState[]>) => {
      state.lendingPools = action.payload
    },
    patchMerchantPool: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<LendingPoolCardState> }>,
    ) => {
      const pool = state.lendingPools.find((p) => p.id === action.payload.id)
      if (pool) Object.assign(pool, action.payload.patch)
    },
    resetMerchantDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMerchantDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshMerchantDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastUpdated = action.payload.refreshedAt
      })
      .addCase(refreshMerchantDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = typeof action.payload === 'string' ? action.payload : 'Refresh failed'
      })
  },
})

export const {
  setMerchantWalletDisplay,
  setMerchantTotalDepositsDisplay,
  setMerchantLendingPools,
  patchMerchantPool,
  resetMerchantDashboard,
} = merchantDashboardSlice.actions
export const merchantDashboardReducer = merchantDashboardSlice.reducer
