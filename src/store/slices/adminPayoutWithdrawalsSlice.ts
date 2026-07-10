import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { AdminWriteOutcome } from '@/api/adminActionResponse'
import {
  fetchAdminRequestsList,
  postApproveDisbursementRequest,
  postApproveWithdrawalRequest,
  postRejectDisbursementRequest,
  postRejectWithdrawalRequest,
  type AdminRequestCounts,
  type AdminRequestRow,
  type AdminRequestStatusFilter,
  type AdminRequestType,
  type AdminRequestTypeFilter,
} from '@/api/adminRequests'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'
import {
  payoutWithdrawalListsEqual,
  payoutWithdrawalsListCacheKey,
} from '@/utils/payoutWithdrawalsListCache'
import { isAbortedThunkAction, isAbortError } from '@/utils/abortError'

export type AdminPayoutWithdrawalsSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminPayoutWithdrawalsActionStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminPayoutWithdrawalsActionKind = 'approve' | 'reject'

export type AdminPayoutWithdrawalsState = AdminListRequestState & {
  counts: AdminRequestCounts
  results: AdminRequestRow[]
  resultsCache: Record<string, AdminRequestRow[]>
  total: number
  listRefreshing: boolean
  status: AdminPayoutWithdrawalsSyncStatus
  error: string | null
  lastUpdated: number | null
  lastStatusFilter: AdminRequestStatusFilter
  lastTypeFilter: AdminRequestTypeFilter
  lastSearch: string
  lastOffset: number
  lastLimit: number
  actionStatus: AdminPayoutWithdrawalsActionStatus
  actionError: string | null
  actionRequestId: string | null
  actionType: AdminRequestType | null
  actionKind: AdminPayoutWithdrawalsActionKind | null
  lastApproveOutcome: AdminWriteOutcome | null
  servicerGasWarning: string | null
}

const emptyCounts: AdminRequestCounts = {
  pending: 0,
  approved: 0,
  rejected: 0,
  withdrawalVolume: '0.00',
}

const initialState: AdminPayoutWithdrawalsState = {
  listRequestId: null,
  counts: emptyCounts,
  results: [],
  resultsCache: {},
  total: 0,
  listRefreshing: false,
  status: 'idle',
  error: null,
  lastUpdated: null,
  lastStatusFilter: 'all',
  lastTypeFilter: 'all',
  lastSearch: '',
  lastOffset: 0,
  lastLimit: 50,
  actionStatus: 'idle',
  actionError: null,
  actionRequestId: null,
  actionType: null,
  actionKind: null,
  lastApproveOutcome: null,
  servicerGasWarning: null,
}

export type RefreshAdminPayoutWithdrawalsParams = {
  status?: AdminRequestStatusFilter
  type?: AdminRequestTypeFilter
  search?: string
  limit?: number
  offset?: number
  background?: boolean
}

export type AdminRequestActionParams = {
  actionId: string
  type: AdminRequestType
  userWallet?: string
}

type RefreshAdminAuth = {
  auth?: { accessToken?: string | null }
}

function currentPayoutListRefreshParams(state: AdminPayoutWithdrawalsState) {
  return {
    status: state.lastStatusFilter,
    type: state.lastTypeFilter,
    search: state.lastSearch || undefined,
    limit: state.lastLimit,
    offset: state.lastOffset,
    background: true as const,
  }
}

export const refreshAdminPayoutWithdrawals = createAsyncThunk(
  'adminPayoutWithdrawals/refresh',
  async (params: RefreshAdminPayoutWithdrawalsParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to load payout and withdrawal requests.')
    }

    const { background: _background, ...filterParams } = params
    const status = filterParams.status ?? 'all'
    const type = filterParams.type ?? 'all'
    const search = filterParams.search?.trim() ?? ''
    const limit = filterParams.limit ?? 50
    const offset = filterParams.offset ?? 0

    try {
      const data = await fetchAdminRequestsList(accessToken, {
        status,
        type,
        search: search || undefined,
        limit,
        offset,
      })

      return {
        fetchedAt: Date.now(),
        filter: { status, type, search, limit, offset },
        counts: data.counts,
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

export const approveAdminRequest = createAsyncThunk(
  'adminPayoutWithdrawals/approve',
  async (params: AdminRequestActionParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth & { adminPayoutWithdrawals: AdminPayoutWithdrawalsState }
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to approve this request.')
    }

    const actionId = params.actionId.trim()
    if (!actionId) {
      throw new Error(
        params.type === 'disbursement'
          ? 'Missing receivable id for disbursement request.'
          : 'Missing withdrawal request id.',
      )
    }

    try {
      let outcome: AdminWriteOutcome
      if (params.type === 'withdrawal') {
        outcome = await postApproveWithdrawalRequest(accessToken, actionId, {
          user: params.userWallet,
          signal: thunkApi.signal,
        })
      } else {
        outcome = await postApproveDisbursementRequest(accessToken, actionId, {
          signal: thunkApi.signal,
        })
      }

      if (thunkApi.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const shouldRefreshList =
        outcome.kind === 'completed' ||
        (outcome.kind === 'governance_queued' && params.type === 'withdrawal')

      if (shouldRefreshList) {
        await thunkApi
          .dispatch(refreshAdminPayoutWithdrawals(currentPayoutListRefreshParams(state.adminPayoutWithdrawals)))
          .unwrap()
      }

      return { params, outcome }
    } catch (e) {
      if (thunkApi.signal.aborted || isAbortError(e)) {
        throw e
      }
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

export const rejectAdminRequest = createAsyncThunk(
  'adminPayoutWithdrawals/reject',
  async (params: AdminRequestActionParams, thunkApi) => {
    const state = thunkApi.getState() as RefreshAdminAuth & { adminPayoutWithdrawals: AdminPayoutWithdrawalsState }
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) {
      throw new Error('Sign in to reject this request.')
    }

    const actionId = params.actionId.trim()
    if (!actionId) {
      throw new Error(
        params.type === 'disbursement'
          ? 'Missing receivable id for disbursement request.'
          : 'Missing withdrawal request id.',
      )
    }

    try {
      if (params.type === 'withdrawal') {
        await postRejectWithdrawalRequest(accessToken, actionId, { signal: thunkApi.signal })
      } else {
        await postRejectDisbursementRequest(accessToken, actionId, { signal: thunkApi.signal })
      }
      if (thunkApi.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      await thunkApi
        .dispatch(refreshAdminPayoutWithdrawals(currentPayoutListRefreshParams(state.adminPayoutWithdrawals)))
        .unwrap()
      return params
    } catch (e) {
      if (thunkApi.signal.aborted || isAbortError(e)) {
        throw e
      }
      if (e instanceof ApiRequestError) {
        return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      }
      throw e
    }
  },
)

const adminPayoutWithdrawalsSlice = createSlice({
  name: 'adminPayoutWithdrawals',
  initialState,
  reducers: {
    resetAdminPayoutWithdrawals: () => initialState,
    clearAdminPayoutWithdrawalsActionError: (state) => {
      state.actionStatus = 'idle'
      state.actionError = null
      state.actionRequestId = null
      state.actionType = null
      state.actionKind = null
    },
    clearAdminPayoutWithdrawalsApproveFeedback: (state) => {
      state.lastApproveOutcome = null
    },
    dismissServicerGasWarning: (state) => {
      state.servicerGasWarning = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminPayoutWithdrawals.pending, (state, action) => {
        state.error = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = payoutWithdrawalsListCacheKey(filter)
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
      .addCase(refreshAdminPayoutWithdrawals.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.status = 'succeeded'
        state.lastUpdated = action.payload.fetchedAt
        state.lastStatusFilter = action.payload.filter.status
        state.lastTypeFilter = action.payload.filter.type
        state.lastSearch = action.payload.filter.search
        state.lastLimit = action.payload.filter.limit
        state.lastOffset = action.payload.filter.offset
        state.counts = action.payload.counts
        state.total = action.payload.total

        const cacheKey = payoutWithdrawalsListCacheKey(action.payload.filter)
        const incoming = action.payload.results
        state.resultsCache[cacheKey] = incoming

        if (!payoutWithdrawalListsEqual(state.results, incoming)) {
          state.results = incoming
        }
      })
      .addCase(refreshAdminPayoutWithdrawals.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = payoutWithdrawalsListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.resultsCache, cacheKey)

        if (Boolean(background) || hasCache || state.results.length > 0) {
          state.error =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh payout and withdrawal requests.'
          return
        }

        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load payout and withdrawal requests.'
      })
      .addCase(approveAdminRequest.pending, (state, action) => {
        state.actionStatus = 'loading'
        state.actionError = null
        state.actionRequestId = action.meta.arg.actionId
        state.actionType = action.meta.arg.type
        state.actionKind = 'approve'
        state.lastApproveOutcome = null
      })
      .addCase(approveAdminRequest.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.actionError = null
        state.actionKind = null
        state.lastApproveOutcome = action.payload.outcome
        if (
          action.payload.outcome.kind === 'completed' &&
          action.payload.outcome.servicerGasWarning
        ) {
          state.servicerGasWarning = action.payload.outcome.servicerGasWarning
        }
      })
      .addCase(approveAdminRequest.rejected, (state, action) => {
        if (isAbortedThunkAction(action)) {
          state.actionStatus = 'idle'
          state.actionError = null
          state.actionRequestId = null
          state.actionType = null
          state.actionKind = null
          return
        }
        state.actionStatus = 'failed'
        state.actionError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not approve request.'
      })
      .addCase(rejectAdminRequest.pending, (state, action) => {
        state.actionStatus = 'loading'
        state.actionError = null
        state.actionRequestId = action.meta.arg.actionId
        state.actionType = action.meta.arg.type
        state.actionKind = 'reject'
      })
      .addCase(rejectAdminRequest.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionError = null
        state.actionKind = null
      })
      .addCase(rejectAdminRequest.rejected, (state, action) => {
        if (isAbortedThunkAction(action)) {
          state.actionStatus = 'idle'
          state.actionError = null
          state.actionRequestId = null
          state.actionType = null
          state.actionKind = null
          return
        }
        state.actionStatus = 'failed'
        state.actionError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not reject request.'
      })
  },
})

export const {
  resetAdminPayoutWithdrawals,
  clearAdminPayoutWithdrawalsActionError,
  clearAdminPayoutWithdrawalsApproveFeedback,
  dismissServicerGasWarning,
} = adminPayoutWithdrawalsSlice.actions
export const adminPayoutWithdrawalsReducer = adminPayoutWithdrawalsSlice.reducer
