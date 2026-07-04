import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  fetchAdminInvestorDetail,
  fetchAdminInvestorsList,
  type AdminInvestorListRow,
  type AdminInvestorsCounts,
  type AdminInvestorsTabFilter,
  type FetchAdminInvestorProfileParams,
} from '@/api/adminKycInvestors'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import {
  resolveInvestmentActivityDetail,
  type InvestmentActivityDetail,
  type InvestmentDetailFields,
  type InvestorProfileDetail,
} from '@/components/admin/investors/investorsMockData'
import { mapAdminInvestorProfileToDetail } from '@/utils/mapAdminInvestorsList'
import {
  adminInvestorListsEqual,
  adminInvestorsListCacheKey,
} from '@/utils/adminInvestorsListCache'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

export type AdminInvestorsSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminInvestorProfileSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AdminInvestorsState = AdminListRequestState & {
  counts: AdminInvestorsCounts
  results: AdminInvestorListRow[]
  resultsCache: Record<string, AdminInvestorListRow[]>
  listRefreshing: boolean
  status: AdminInvestorsSyncStatus
  error: string | null
  lastUpdated: number | null
  lastFilter: AdminInvestorsTabFilter
  lastSearch: string
  profileStatus: AdminInvestorProfileSyncStatus
  profileError: string | null
  profileInvestorId: string | null
  profileRequestId: string | null
  lastProfileRequest: RefreshAdminInvestorProfileParams | null
  profilesById: Record<string, InvestorProfileDetail>
  investmentRecordDetails: Record<string, InvestmentDetailFields>
}

const emptyCounts: AdminInvestorsCounts = {
  totalInvestors: 0,
  totalInvested: '0.00',
  totalEarningsPaid: '0.00',
  frozenAccounts: 0,
}

const initialState: AdminInvestorsState = {
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
  profileInvestorId: null,
  profileRequestId: null,
  lastProfileRequest: null,
  profilesById: {},
  investmentRecordDetails: {},
}

export type RefreshAdminInvestorsParams = {
  status?: AdminInvestorsTabFilter
  search?: string
  limit?: number
  offset?: number
  background?: boolean
}

export type RefreshAdminInvestorProfileParams = {
  investorUserId: string
  activeSearch?: string
  historySearch?: string
  activitySearch?: string
  activityType?: FetchAdminInvestorProfileParams['activityType']
} & Pick<
  FetchAdminInvestorProfileParams,
  | 'activeLimit'
  | 'activeOffset'
  | 'historyLimit'
  | 'historyOffset'
  | 'activityLimit'
  | 'activityOffset'
>

type RefreshAdminAuth = {
  auth?: { accessToken?: string | null }
}

export const refreshAdminInvestors = createAsyncThunk(
  'adminInvestors/refresh',
  async (params: RefreshAdminInvestorsParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load admin investors.')
    }

    const { background: _background, ...filterParams } = params
    const status = filterParams.status ?? 'all'
    const search = filterParams.search?.trim() ?? ''

    try {
      const data = await fetchAdminInvestorsList(accessToken, {
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

export const refreshAdminInvestorProfile = createAsyncThunk(
  'adminInvestors/refreshProfile',
  async (params: RefreshAdminInvestorProfileParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load investor profile.')
    }

    const investorUserId = params.investorUserId.trim()
    if (!investorUserId) {
      throw new Error('Missing investor id.')
    }

    try {
      const detail = await fetchAdminInvestorDetail(accessToken, investorUserId, {
        activeSearch: params.activeSearch?.trim() || undefined,
        historySearch: params.historySearch?.trim() || undefined,
        activitySearch: params.activitySearch?.trim() || undefined,
        activityType: params.activityType,
        activeLimit: params.activeLimit,
        activeOffset: params.activeOffset,
        historyLimit: params.historyLimit,
        historyOffset: params.historyOffset,
        activityLimit: params.activityLimit,
        activityOffset: params.activityOffset,
      })
      return {
        investorUserId,
        profile: mapAdminInvestorProfileToDetail(detail),
      }
    } catch (e) {
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

const adminInvestorsSlice = createSlice({
  name: 'adminInvestors',
  initialState,
  reducers: {
    resetAdminInvestors: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminInvestors.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminInvestorsListCacheKey(filter)
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
      .addCase(refreshAdminInvestors.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastFilter = action.payload.filter.status
        state.lastSearch = action.payload.filter.search
        state.counts = action.payload.counts

        const cacheKey = adminInvestorsListCacheKey(action.payload.filter)
        const incoming = action.payload.results
        state.resultsCache[cacheKey] = incoming

        if (!adminInvestorListsEqual(state.results, incoming)) {
          state.results = incoming
        }
      })
      .addCase(refreshAdminInvestors.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = adminInvestorsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.results.length > 0) {
          state.error =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh investors.'
          return
        }

        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load investors.'
      })
      .addCase(refreshAdminInvestorProfile.pending, (state, action) => {
        state.profileStatus = 'loading'
        state.profileError = null
        state.profileInvestorId = action.meta.arg.investorUserId
        state.profileRequestId = action.meta.requestId
        state.lastProfileRequest = action.meta.arg
      })
      .addCase(refreshAdminInvestorProfile.fulfilled, (state, action) => {
        if (state.profileRequestId !== action.meta.requestId) return
        state.profileStatus = 'succeeded'
        state.profilesById[action.payload.investorUserId] = action.payload.profile
      })
      .addCase(refreshAdminInvestorProfile.rejected, (state, action) => {
        state.profileStatus = 'failed'
        state.profileError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load investor profile.'
      })
  },
})

export const { resetAdminInvestors } = adminInvestorsSlice.actions
export const adminInvestorsReducer = adminInvestorsSlice.reducer

export type { AdminInvestorsState as AdminInvestorsSliceState }

export function selectInvestorProfile(
  state: AdminInvestorsState,
  investorId: string,
): InvestorProfileDetail | null {
  return state.profilesById[investorId] ?? null
}

export function selectInvestmentActivityDetail(
  state: AdminInvestorsState,
  investorId: string,
  recordId: string,
): InvestmentActivityDetail | null {
  const profile = selectInvestorProfile(state, investorId)
  if (!profile) return null
  return resolveInvestmentActivityDetail(profile, recordId, state.investmentRecordDetails)
}
