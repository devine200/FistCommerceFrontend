import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RecentPayoutBundle } from '@/api/payout'
import type { RecentTx } from '@/components/dashboard/investor/lending-pool-detail/types'

const INVESTOR_DASHBOARD_REFRESH_REJECTED = 'investorDashboard/refresh/rejected'
const INVESTOR_DASHBOARD_RESET = 'investorDashboard/resetInvestorDashboard'

export type RecentTransactionsState = {
  items: RecentTx[]
  poolContractAddress: string | null
  explorerBaseUrl: string | null
  /** `null` until the first successful investor dashboard refresh includes a payout fetch. */
  lastUpdated: number | null
}

const initialState: RecentTransactionsState = {
  items: [],
  poolContractAddress: null,
  explorerBaseUrl: null,
  lastUpdated: null,
}

export type SetRecentPayoutPayload = {
  bundle: RecentPayoutBundle
  fetchedAt: number
}

const recentTransactionsSlice = createSlice({
  name: 'recentTransactions',
  initialState,
  reducers: {
    setRecentPayoutBundle: (state, action: PayloadAction<SetRecentPayoutPayload>) => {
      const { bundle, fetchedAt } = action.payload
      state.items = bundle.transactions
      state.poolContractAddress = bundle.contractAddress
      state.explorerBaseUrl = bundle.explorerBaseUrl
      state.lastUpdated = fetchedAt
    },
    clearRecentTransactions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type === INVESTOR_DASHBOARD_REFRESH_REJECTED,
        () => initialState,
      )
      .addMatcher((action) => action.type === INVESTOR_DASHBOARD_RESET, () => initialState)
  },
})

export const { setRecentPayoutBundle, clearRecentTransactions } = recentTransactionsSlice.actions
export const recentTransactionsReducer = recentTransactionsSlice.reducer
