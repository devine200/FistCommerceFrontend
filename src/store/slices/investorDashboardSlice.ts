import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type LendingPoolCardState = {
  id: string
  viewDetailsTo: string
  poolTitle: string
  tagline?: string
  apyDisplay?: string
  tvlDisplay?: string
  minDepositDisplay?: string
  utilizationDisplay?: string
}

export type InvestorDashboardSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type InvestorDashboardState = {
  walletDisplay: string
  lendingPools: LendingPoolCardState[]
  status: InvestorDashboardSyncStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: InvestorDashboardState = {
  walletDisplay: '0x7A3F...92C1',
  lendingPools: [
    {
      id: 'fist-commerce-lending-pool',
      viewDetailsTo: '/dashboard/investor/lending-pool/fist-commerce-lending-pool',
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

export const refreshInvestorDashboard = createAsyncThunk('investorDashboard/refresh', async () => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 400)
  })
  return { refreshedAt: Date.now() }
})

const investorDashboardSlice = createSlice({
  name: 'investorDashboard',
  initialState,
  reducers: {
    setInvestorWalletDisplay: (state, action: PayloadAction<string>) => {
      state.walletDisplay = action.payload
    },
    setInvestorLendingPools: (state, action: PayloadAction<LendingPoolCardState[]>) => {
      state.lendingPools = action.payload
    },
    patchInvestorPool: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<LendingPoolCardState> }>,
    ) => {
      const pool = state.lendingPools.find((p) => p.id === action.payload.id)
      if (pool) Object.assign(pool, action.payload.patch)
    },
    resetInvestorDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshInvestorDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshInvestorDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastUpdated = action.payload.refreshedAt
      })
      .addCase(refreshInvestorDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = typeof action.payload === 'string' ? action.payload : 'Refresh failed'
      })
  },
})

export const {
  setInvestorWalletDisplay,
  setInvestorLendingPools,
  patchInvestorPool,
  resetInvestorDashboard,
} = investorDashboardSlice.actions
export const investorDashboardReducer = investorDashboardSlice.reducer
