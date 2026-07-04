import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  fetchAdminReceivablesList,
  type AdminReceivablesCounts,
  type AdminReceivablesTabFilter,
  type AdminReceivableListRow,
} from '@/api/adminLoan'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import {
  adminReceivableListsEqual,
  adminReceivablesListCacheKey,
} from '@/utils/adminReceivablesListCache'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

export type AdminReceivablesSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AdminReceivablesState = AdminListRequestState & {
  counts: AdminReceivablesCounts
  results: AdminReceivableListRow[]
  resultsCache: Record<string, AdminReceivableListRow[]>
  listRefreshing: boolean
  status: AdminReceivablesSyncStatus
  error: string | null
  lastUpdated: number | null
  lastFilter: AdminReceivablesTabFilter
  lastSearch: string
}

const emptyCounts: AdminReceivablesCounts = {
  pending: 0,
  underReview: 0,
  approved: 0,
  rejected: 0,
}

const initialState: AdminReceivablesState = {
  listRequestId: null,
  counts: emptyCounts,
  results: [],
  resultsCache: {},
  listRefreshing: false,
  status: 'idle',
  error: null,
  lastUpdated: null,
  lastFilter: 'all',
  lastSearch: '',
}

export type RefreshAdminReceivablesParams = {
  status?: AdminReceivablesTabFilter
  search?: string
  limit?: number
  offset?: number
  background?: boolean
}

type RefreshAdminAuth = {
  auth?: { accessToken?: string | null }
}

export const refreshAdminReceivables = createAsyncThunk(
  'adminReceivables/refresh',
  async (params: RefreshAdminReceivablesParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load admin receivables.')
    }

    const { background: _background, ...filterParams } = params
    const status = filterParams.status ?? 'all'
    const search = filterParams.search?.trim() ?? ''

    try {
      const data = await fetchAdminReceivablesList(accessToken, {
        status,
        search: search || undefined,
        limit: filterParams.limit,
        offset: filterParams.offset,
      })
      return {
        fetchedAt: Date.now(),
        filter: { status, search, limit: filterParams.limit, offset: filterParams.offset },
        counts: data.counts,
        results: data.results,
      }
    } catch (e) {
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

const adminReceivablesSlice = createSlice({
  name: 'adminReceivables',
  initialState,
  reducers: {
    resetAdminReceivables: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminReceivables.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminReceivablesListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)
        const cached = state.resultsCache[cacheKey] ?? []
        const nextStatus = filter.status ?? 'all'
        const nextSearch = filter.search?.trim() ?? ''
        const filterChanged = nextStatus !== state.lastFilter || nextSearch !== state.lastSearch
        const useBackground = Boolean(background) || hasCache

        if (filterChanged) {
          state.lastFilter = nextStatus
          state.lastSearch = nextSearch
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
      .addCase(refreshAdminReceivables.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastFilter = action.payload.filter.status
        state.lastSearch = action.payload.filter.search
        state.counts = action.payload.counts

        const cacheKey = adminReceivablesListCacheKey(action.payload.filter)
        const incoming = action.payload.results
        state.resultsCache[cacheKey] = incoming

        if (!adminReceivableListsEqual(state.results, incoming)) {
          state.results = incoming
        }
      })
      .addCase(refreshAdminReceivables.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminReceivablesListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.results.length > 0) {
          state.error =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh receivables.'
          return
        }

        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load receivables.'
      })
  },
})

export const { resetAdminReceivables } = adminReceivablesSlice.actions
export const adminReceivablesReducer = adminReceivablesSlice.reducer
