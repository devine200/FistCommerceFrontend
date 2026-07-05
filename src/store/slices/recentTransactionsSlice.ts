import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { fetchRecentPayoutTransactions, type FetchRecentPayoutTransactionsParams } from '@/api/payout'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import type { RecentTx } from '@/components/dashboard/investor/lending-pool-detail/types'
import {
  dashboardTransactionListsEqual,
  dashboardTransactionsListCacheKey,
} from '@/utils/dashboardTransactionsList'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

const INVESTOR_DASHBOARD_REFRESH_REJECTED = 'investorDashboard/refresh/rejected'
const INVESTOR_DASHBOARD_RESET = 'investorDashboard/resetInvestorDashboard'

export type RecentTransactionsSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type RecentTransactionsState = AdminListRequestState & {
  items: RecentTx[]
  resultsCache: Record<string, RecentTx[]>
  listRefreshing: boolean
  total: number
  poolContractAddress: string | null
  explorerBaseUrl: string | null
  status: RecentTransactionsSyncStatus
  error: string | null
  lastUpdated: number | null
  lastOffset: number
  lastLimit: number
}

const initialState: RecentTransactionsState = {
  listRequestId: null,
  items: [],
  resultsCache: {},
  listRefreshing: false,
  total: 0,
  poolContractAddress: null,
  explorerBaseUrl: null,
  status: 'idle',
  error: null,
  lastUpdated: null,
  lastOffset: 0,
  lastLimit: DASHBOARD_LIST_PAGE_SIZE,
}

export type SetRecentPayoutPayload = {
  bundle: {
    transactions: RecentTx[]
    contractAddress: string | null
    explorerBaseUrl: string | null
    total: number
  }
  fetchedAt: number
  filter?: FetchRecentPayoutTransactionsParams
}

export type RefreshRecentTransactionsParams = FetchRecentPayoutTransactionsParams & {
  background?: boolean
}

type RefreshRecentAuth = {
  auth?: { accessToken?: string | null }
  kyc?: { status?: string }
}

export function recentTransactionsListCacheKey(
  filter: FetchRecentPayoutTransactionsParams = {},
): string {
  return dashboardTransactionsListCacheKey('recent-payout', filter)
}

export const refreshRecentTransactions = createAsyncThunk(
  'recentTransactions/refresh',
  async (params: RefreshRecentTransactionsParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshRecentAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load recent transactions.')
    }
    if (state.kyc?.status !== 'verified') {
      return {
        fetchedAt: Date.now(),
        filter: {
          limit: params.limit ?? DASHBOARD_LIST_PAGE_SIZE,
          offset: params.offset ?? 0,
        },
        bundle: {
          transactions: [],
          contractAddress: null,
          explorerBaseUrl: null,
          total: 0,
        },
      }
    }

    const { background: _background, ...filterParams } = params
    const limit = filterParams.limit ?? DASHBOARD_LIST_PAGE_SIZE
    const offset = filterParams.offset ?? 0
    const bundle = await fetchRecentPayoutTransactions(accessToken, { limit, offset })

    return {
      fetchedAt: Date.now(),
      filter: { limit, offset },
      bundle,
    }
  },
)

const recentTransactionsSlice = createSlice({
  name: 'recentTransactions',
  initialState,
  reducers: {
    setRecentPayoutBundle: (state, action: PayloadAction<SetRecentPayoutPayload>) => {
      const { bundle, fetchedAt, filter } = action.payload
      const limit = filter?.limit ?? DASHBOARD_LIST_PAGE_SIZE
      const offset = filter?.offset ?? 0
      const cacheKey = recentTransactionsListCacheKey({ limit, offset })

      state.items = bundle.transactions
      state.total = bundle.total
      state.poolContractAddress = bundle.contractAddress
      state.explorerBaseUrl = bundle.explorerBaseUrl
      state.lastUpdated = fetchedAt
      state.lastOffset = offset
      state.lastLimit = limit
      state.status = 'succeeded'
      state.resultsCache[cacheKey] = bundle.transactions
    },
    clearRecentTransactions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshRecentTransactions.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = recentTransactionsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)
        const cached = state.resultsCache[cacheKey] ?? []
        const nextOffset = filter.offset ?? 0
        const filterChanged = nextOffset !== state.lastOffset
        const useBackground = Boolean(background) || hasCache

        if (filterChanged) {
          state.lastOffset = nextOffset
          state.lastLimit = filter.limit ?? DASHBOARD_LIST_PAGE_SIZE
          if (hasCache) {
            state.items = cached
            state.status = 'succeeded'
          } else {
            state.items = []
            state.status = 'loading'
          }
        } else if (useBackground) {
          state.listRefreshing = true
          return
        }

        if (useBackground) {
          state.listRefreshing = true
          return
        }

        state.status = 'loading'
        if (!hasCache) {
          state.items = []
        }
      })
      .addCase(refreshRecentTransactions.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastOffset = action.payload.filter.offset
        state.lastLimit = action.payload.filter.limit
        state.poolContractAddress = action.payload.bundle.contractAddress
        state.explorerBaseUrl = action.payload.bundle.explorerBaseUrl
        state.total = action.payload.bundle.total

        const cacheKey = recentTransactionsListCacheKey(action.payload.filter)
        const incoming = action.payload.bundle.transactions
        state.resultsCache[cacheKey] = incoming

        if (!dashboardTransactionListsEqual(state.items, incoming)) {
          state.items = incoming
        }
      })
      .addCase(refreshRecentTransactions.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = recentTransactionsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.items.length > 0) {
          state.error = action.error.message ?? 'Could not refresh recent transactions.'
          return
        }

        state.status = 'failed'
        state.error = action.error.message ?? 'Could not load recent transactions.'
      })
      .addMatcher(
        (action) => action.type === INVESTOR_DASHBOARD_REFRESH_REJECTED,
        () => initialState,
      )
      .addMatcher((action) => action.type === INVESTOR_DASHBOARD_RESET, () => initialState)
  },
})

export const { setRecentPayoutBundle, clearRecentTransactions } = recentTransactionsSlice.actions
export const recentTransactionsReducer = recentTransactionsSlice.reducer
