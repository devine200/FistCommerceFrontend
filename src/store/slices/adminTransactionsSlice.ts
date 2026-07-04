import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  fetchAdminTransactionsList,
  type AdminTransactionTabFilter,
  type AdminTransactionType,
  type AdminTransactionRow,
  type AdminTransactionsSummary,
} from '@/api/adminTransactions'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import {
  adminTransactionListsEqual,
  adminTransactionsListCacheKey,
} from '@/utils/adminTransactionsListCache'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

export type AdminTransactionsSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AdminTransactionsState = AdminListRequestState & {
  summary: AdminTransactionsSummary
  results: AdminTransactionRow[]
  resultsCache: Record<string, AdminTransactionRow[]>
  listRefreshing: boolean
  total: number
  status: AdminTransactionsSyncStatus
  error: string | null
  lastUpdated: number | null
  lastStatusFilter: AdminTransactionTabFilter
  lastTypeFilter: AdminTransactionType | 'all'
  lastSearch: string
  lastOffset: number
  lastLimit: number
}

const emptySummary: AdminTransactionsSummary = {
  deposits: '0.00',
  withdrawals: '0.00',
  disbursements: '0.00',
  repayments: '0.00',
}

const initialState: AdminTransactionsState = {
  listRequestId: null,
  summary: emptySummary,
  results: [],
  resultsCache: {},
  listRefreshing: false,
  total: 0,
  status: 'idle',
  error: null,
  lastUpdated: null,
  lastStatusFilter: 'all',
  lastTypeFilter: 'all',
  lastSearch: '',
  lastOffset: 0,
  lastLimit: 50,
}

export type RefreshAdminTransactionsParams = {
  status?: AdminTransactionTabFilter
  type?: AdminTransactionType | 'all'
  search?: string
  limit?: number
  offset?: number
  background?: boolean
}

type RefreshAdminAuth = {
  auth?: { accessToken?: string | null }
}

export const refreshAdminTransactions = createAsyncThunk(
  'adminTransactions/refresh',
  async (params: RefreshAdminTransactionsParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load admin transactions.')
    }

    const { background: _background, ...filterParams } = params
    const status = filterParams.status ?? 'all'
    const type = filterParams.type ?? 'all'
    const search = filterParams.search?.trim() ?? ''
    const limit = filterParams.limit ?? 50
    const offset = filterParams.offset ?? 0

    try {
      const data = await fetchAdminTransactionsList(accessToken, {
        status,
        type,
        search: search || undefined,
        limit,
        offset,
      })
      return {
        fetchedAt: Date.now(),
        filter: { status, type, search, limit, offset },
        summary: data.summary,
        results: data.results,
        total: data.total,
      }
    } catch (e) {
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

const adminTransactionsSlice = createSlice({
  name: 'adminTransactions',
  initialState,
  reducers: {
    resetAdminTransactions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminTransactions.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminTransactionsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)
        const cached = state.resultsCache[cacheKey] ?? []
        const nextStatus = filter.status ?? 'all'
        const nextType = filter.type ?? 'all'
        const nextSearch = filter.search?.trim() ?? ''
        const nextOffset = filter.offset ?? 0
        const filterChanged =
          nextStatus !== state.lastStatusFilter ||
          nextType !== state.lastTypeFilter ||
          nextSearch !== state.lastSearch ||
          nextOffset !== state.lastOffset
        const useBackground = Boolean(background) || hasCache

        if (filterChanged) {
          state.lastStatusFilter = nextStatus
          state.lastTypeFilter = nextType
          state.lastSearch = nextSearch
          state.lastOffset = nextOffset
          if (hasCache) {
            state.results = cached
            state.status = 'succeeded'
          } else {
            state.results = []
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
          state.results = []
        }
      })
      .addCase(refreshAdminTransactions.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastStatusFilter = action.payload.filter.status
        state.lastTypeFilter = action.payload.filter.type
        state.lastSearch = action.payload.filter.search
        state.lastLimit = action.payload.filter.limit
        state.lastOffset = action.payload.filter.offset
        state.summary = action.payload.summary
        state.total = action.payload.total

        const cacheKey = adminTransactionsListCacheKey(action.payload.filter)
        const incoming = action.payload.results
        state.resultsCache[cacheKey] = incoming

        if (!adminTransactionListsEqual(state.results, incoming)) {
          state.results = incoming
        }
      })
      .addCase(refreshAdminTransactions.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminTransactionsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.results.length > 0) {
          state.error =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh transactions.'
          return
        }

        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load transactions.'
      })
  },
})

export const { resetAdminTransactions } = adminTransactionsSlice.actions
export const adminTransactionsReducer = adminTransactionsSlice.reducer
