import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  fetchAdminMerchantDetail,
  fetchAdminMerchantsList,
  type AdminMerchantListRow,
  type AdminMerchantsCounts,
  type AdminMerchantsTabFilter,
  type FetchAdminMerchantProfileParams,
} from '@/api/adminKycMerchants'
import { ApiRequestError } from '@/api/client'
import type { MerchantProfileDetail } from '@/components/admin/merchants/merchantsMockData'
import { mapAdminMerchantProfileToDetail } from '@/utils/mapAdminMerchantsList'
import {
  adminMerchantListsEqual,
  adminMerchantsListCacheKey,
} from '@/utils/adminMerchantsListCache'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

export type AdminMerchantsSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminMerchantProfileSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AdminMerchantsState = AdminListRequestState & {
  counts: AdminMerchantsCounts
  results: AdminMerchantListRow[]
  resultsCache: Record<string, AdminMerchantListRow[]>
  listRefreshing: boolean
  status: AdminMerchantsSyncStatus
  error: string | null
  lastUpdated: number | null
  lastFilter: AdminMerchantsTabFilter
  lastSearch: string
  profileStatus: AdminMerchantProfileSyncStatus
  profileError: string | null
  profileMerchantId: string | null
  lastProfileRequest: RefreshAdminMerchantProfileParams | null
  profilesById: Record<string, MerchantProfileDetail>
}

const emptyCounts: AdminMerchantsCounts = {
  totalMerchants: 0,
  activeMerchants: 0,
  underReview: 0,
  rejectedMerchants: 0,
}

const initialState: AdminMerchantsState = {
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
  profileStatus: 'idle',
  profileError: null,
  profileMerchantId: null,
  lastProfileRequest: null,
  profilesById: {},
}

export type RefreshAdminMerchantsParams = {
  status?: AdminMerchantsTabFilter
  search?: string
  limit?: number
  offset?: number
  background?: boolean
}

export type RefreshAdminMerchantProfileParams = {
  merchantUserId: string
  activeSearch?: string
  allSearch?: string
} & Pick<
  FetchAdminMerchantProfileParams,
  'activeLimit' | 'activeOffset' | 'allLimit' | 'allOffset'
>

type RefreshAdminAuth = {
  auth?: { accessToken?: string | null }
}

export const refreshAdminMerchants = createAsyncThunk(
  'adminMerchants/refresh',
  async (params: RefreshAdminMerchantsParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load admin merchants.')
    }

    const { background: _background, ...filterParams } = params
    const status = filterParams.status ?? 'all'
    const search = filterParams.search?.trim() ?? ''

    try {
      const data = await fetchAdminMerchantsList(accessToken, {
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
        return thunkApi.rejectWithValue(e.message)
      }
      throw e
    }
  },
)

export const refreshAdminMerchantProfile = createAsyncThunk(
  'adminMerchants/refreshProfile',
  async (params: RefreshAdminMerchantProfileParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load merchant profile.')
    }

    const merchantUserId = params.merchantUserId.trim()
    if (!merchantUserId) {
      throw new Error('Missing merchant id.')
    }

    try {
      const detail = await fetchAdminMerchantDetail(accessToken, merchantUserId, {
        activeSearch: params.activeSearch?.trim() || undefined,
        allSearch: params.allSearch?.trim() || undefined,
        activeLimit: params.activeLimit,
        activeOffset: params.activeOffset,
        allLimit: params.allLimit,
        allOffset: params.allOffset,
      })
      return {
        merchantUserId,
        profile: mapAdminMerchantProfileToDetail(detail),
      }
    } catch (e) {
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(e.message)
      }
      throw e
    }
  },
)

const adminMerchantsSlice = createSlice({
  name: 'adminMerchants',
  initialState,
  reducers: {
    resetAdminMerchants: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminMerchants.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminMerchantsListCacheKey(filter)
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
      .addCase(refreshAdminMerchants.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastFilter = action.payload.filter.status
        state.lastSearch = action.payload.filter.search
        state.counts = action.payload.counts

        const cacheKey = adminMerchantsListCacheKey(action.payload.filter)
        const incoming = action.payload.results
        state.resultsCache[cacheKey] = incoming

        if (!adminMerchantListsEqual(state.results, incoming)) {
          state.results = incoming
        }
      })
      .addCase(refreshAdminMerchants.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminMerchantsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.results.length > 0) {
          state.error =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh merchants.'
          return
        }

        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load merchants.'
      })
      .addCase(refreshAdminMerchantProfile.pending, (state, action) => {
        state.profileStatus = 'loading'
        state.profileError = null
        state.profileMerchantId = action.meta.arg.merchantUserId
        state.lastProfileRequest = action.meta.arg
      })
      .addCase(refreshAdminMerchantProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded'
        state.profilesById[action.payload.merchantUserId] = action.payload.profile
      })
      .addCase(refreshAdminMerchantProfile.rejected, (state, action) => {
        state.profileStatus = 'failed'
        state.profileError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load merchant profile.'
      })
  },
})

export const { resetAdminMerchants } = adminMerchantsSlice.actions
export const adminMerchantsReducer = adminMerchantsSlice.reducer

export type { AdminMerchantsState as AdminMerchantsSliceState }

export function selectMerchantProfile(
  state: AdminMerchantsState,
  merchantId: string,
): MerchantProfileDetail | null {
  return state.profilesById[merchantId] ?? null
}
