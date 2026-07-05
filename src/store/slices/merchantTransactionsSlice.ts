import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  fetchMerchantTransactionsList,
  type FetchMerchantTransactionsParams,
  type MerchantTransactionApi,
} from '@/api/metrics'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import {
  dashboardTransactionListsEqual,
  dashboardTransactionsListCacheKey,
} from '@/utils/dashboardTransactionsList'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

export type MerchantTransactionsSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MerchantTransactionsState = AdminListRequestState & {
  items: MerchantTransactionApi[]
  resultsCache: Record<string, MerchantTransactionApi[]>
  listRefreshing: boolean
  total: number
  status: MerchantTransactionsSyncStatus
  error: string | null
  lastUpdated: number | null
  lastTypeFilter: FetchMerchantTransactionsParams['type']
  lastSearch: string
  lastOffset: number
  lastLimit: number
}

const initialState: MerchantTransactionsState = {
  listRequestId: null,
  items: [],
  resultsCache: {},
  listRefreshing: false,
  total: 0,
  status: 'idle',
  error: null,
  lastUpdated: null,
  lastTypeFilter: 'all',
  lastSearch: '',
  lastOffset: 0,
  lastLimit: DASHBOARD_LIST_PAGE_SIZE,
}

export type RefreshMerchantTransactionsParams = FetchMerchantTransactionsParams & {
  background?: boolean
}

type RefreshMerchantAuth = {
  auth?: { accessToken?: string | null }
  kyc?: { status?: string }
}

export function merchantTransactionsListCacheKey(
  filter: FetchMerchantTransactionsParams = {},
): string {
  return dashboardTransactionsListCacheKey('merchant-transactions', filter)
}

export const refreshMerchantTransactions = createAsyncThunk(
  'merchantTransactions/refresh',
  async (params: RefreshMerchantTransactionsParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshMerchantAuth
    const accessToken = state.auth?.accessToken
    const isKycVerified = state.kyc?.status === 'verified'
    const { background: _background, ...filterParams } = params
    const type = filterParams.type ?? 'all'
    const search = filterParams.search?.trim() ?? ''
    const limit = filterParams.limit ?? DASHBOARD_LIST_PAGE_SIZE
    const offset = filterParams.offset ?? 0

    if (!isKycVerified) {
      return {
        fetchedAt: Date.now(),
        filter: { type, search, limit, offset },
        transactions: [] as MerchantTransactionApi[],
        total: 0,
      }
    }

    try {
      const data = await fetchMerchantTransactionsList(accessToken, {
        type,
        search: search || undefined,
        limit,
        offset,
      })
      return {
        fetchedAt: Date.now(),
        filter: { type, search, limit, offset },
        transactions: data.transactions,
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

const merchantTransactionsSlice = createSlice({
  name: 'merchantTransactions',
  initialState,
  reducers: {
    clearMerchantTransactions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMerchantTransactions.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = merchantTransactionsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)
        const cached = state.resultsCache[cacheKey] ?? []
        const nextType = filter.type ?? 'all'
        const nextSearch = filter.search?.trim() ?? ''
        const nextOffset = filter.offset ?? 0
        const filterChanged =
          nextType !== state.lastTypeFilter ||
          nextSearch !== state.lastSearch ||
          nextOffset !== state.lastOffset
        const useBackground = Boolean(background) || hasCache

        if (filterChanged) {
          state.lastTypeFilter = nextType
          state.lastSearch = nextSearch
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
      .addCase(refreshMerchantTransactions.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastTypeFilter = action.payload.filter.type
        state.lastSearch = action.payload.filter.search
        state.lastLimit = action.payload.filter.limit
        state.lastOffset = action.payload.filter.offset
        state.total = action.payload.total

        const cacheKey = merchantTransactionsListCacheKey(action.payload.filter)
        const incoming = action.payload.transactions
        state.resultsCache[cacheKey] = incoming

        if (!dashboardTransactionListsEqual(state.items, incoming)) {
          state.items = incoming
        }
      })
      .addCase(refreshMerchantTransactions.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = merchantTransactionsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.items.length > 0) {
          state.error =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh merchant transactions.'
          return
        }

        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load merchant transactions.'
      })
  },
})

export const { clearMerchantTransactions } = merchantTransactionsSlice.actions
export const merchantTransactionsReducer = merchantTransactionsSlice.reducer
