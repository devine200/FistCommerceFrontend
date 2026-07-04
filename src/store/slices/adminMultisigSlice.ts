import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { AdminWriteOutcome } from '@/api/adminActionResponse'
import { ApiRequestError, formatApiRequestErrorPlain } from '@/api/client'
import { fetchMultisigConfig } from '@/api/multisig/config'
import {
  fetchMultisigProposalDetail,
  fetchMultisigProposals,
  postMultisigProposalCancel,
  postMultisigProposalExecute,
  postMultisigProposalSign,
  type FetchMultisigProposalsParams,
} from '@/api/multisig/proposals'
import type { MultisigConfig, ProposalDetail, ProposalListRow } from '@/api/types/multisig'
import {
  governanceListCacheKey,
  governanceProposalListsEqual,
} from '@/admin/governance/governanceListCache'
import {
  isLatestAdminListRequest,
  markAdminListRequestPending,
  type AdminListRequestState,
} from '@/store/adminListRefresh'

export type RefreshMultisigProposalsParams = FetchMultisigProposalsParams & {
  /** When true, keep showing cached rows and skip loading UI. */
  background?: boolean
}

export type AdminMultisigSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminMultisigActionStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AdminMultisigActionKind = 'sign' | 'execute' | 'cancel'

export type AdminMultisigState = AdminListRequestState & {
  config: MultisigConfig | null
  configStatus: AdminMultisigSyncStatus
  configError: string | null
  proposals: ProposalListRow[]
  proposalsCache: Record<string, ProposalListRow[]>
  listStatus: AdminMultisigSyncStatus
  listRefreshing: boolean
  listError: string | null
  lastListFilter: FetchMultisigProposalsParams
  lastListUpdated: number | null
  detailStatus: AdminMultisigSyncStatus
  detailError: string | null
  detailProposalId: string | null
  detailsById: Record<string, ProposalDetail>
  actionStatus: AdminMultisigActionStatus
  actionError: string | null
  actionProposalId: string | null
  actionKind: AdminMultisigActionKind | null
  lastExecuteOutcome: AdminWriteOutcome | null
}

const initialState: AdminMultisigState = {
  listRequestId: null,
  config: null,
  configStatus: 'idle',
  configError: null,
  proposals: [],
  proposalsCache: {},
  listStatus: 'idle',
  listRefreshing: false,
  listError: null,
  lastListFilter: {},
  lastListUpdated: null,
  detailStatus: 'idle',
  detailError: null,
  detailProposalId: null,
  detailsById: {},
  actionStatus: 'idle',
  actionError: null,
  actionProposalId: null,
  actionKind: null,
  lastExecuteOutcome: null,
}

type AuthSlice = { auth?: { accessToken?: string | null } }

export const refreshMultisigConfig = createAsyncThunk(
  'adminMultisig/refreshConfig',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to load multisig config.')
    try {
      return await fetchMultisigConfig(accessToken)
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      throw e
    }
  },
)

export const refreshMultisigProposals = createAsyncThunk(
  'adminMultisig/refreshList',
  async (params: RefreshMultisigProposalsParams | undefined, thunkApi) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to load governance proposals.')
    const { background: _background, ...filter } = params ?? {}
    try {
      const proposals = await fetchMultisigProposals(accessToken, filter)
      return { proposals, filter, fetchedAt: Date.now() }
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      throw e
    }
  },
)

export const refreshMultisigProposalDetail = createAsyncThunk(
  'adminMultisig/refreshDetail',
  async (proposalId: string, thunkApi) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to load proposal detail.')
    const id = proposalId.trim()
    if (!id) throw new Error('Missing proposal id.')
    try {
      const detail = await fetchMultisigProposalDetail(accessToken, id)
      return detail
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      throw e
    }
  },
)

export const signMultisigProposal = createAsyncThunk(
  'adminMultisig/sign',
  async (
    params: { proposalId: string; signerAddress: string; signature: string },
    thunkApi,
  ) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to submit signature.')
    try {
      await postMultisigProposalSign(accessToken, params.proposalId, {
        signerAddress: params.signerAddress,
        signature: params.signature,
      })
      await thunkApi.dispatch(refreshMultisigProposalDetail(params.proposalId)).unwrap()
      return params.proposalId
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      throw e
    }
  },
)

export const executeMultisigProposal = createAsyncThunk(
  'adminMultisig/execute',
  async (proposalId: string, thunkApi) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to execute proposal.')
    try {
      const result = await postMultisigProposalExecute(accessToken, proposalId)
      await thunkApi.dispatch(refreshMultisigProposalDetail(proposalId)).unwrap()
      return { proposalId, result }
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      throw e
    }
  },
)

export const cancelMultisigProposal = createAsyncThunk(
  'adminMultisig/cancel',
  async (proposalId: string, thunkApi) => {
    const state = thunkApi.getState() as AuthSlice
    const accessToken = state.auth?.accessToken
    if (!accessToken?.trim()) throw new Error('Sign in to cancel proposal.')
    try {
      await postMultisigProposalCancel(accessToken, proposalId)
      await thunkApi.dispatch(refreshMultisigProposalDetail(proposalId)).unwrap()
      return proposalId
    } catch (e) {
      if (e instanceof ApiRequestError) return thunkApi.rejectWithValue(formatApiRequestErrorPlain(e))
      throw e
    }
  },
)

const adminMultisigSlice = createSlice({
  name: 'adminMultisig',
  initialState,
  reducers: {
    resetAdminMultisig: () => initialState,
    clearAdminMultisigActionError: (state) => {
      state.actionStatus = 'idle'
      state.actionError = null
      state.actionProposalId = null
      state.actionKind = null
    },
    clearLastExecuteOutcome: (state) => {
      state.lastExecuteOutcome = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMultisigConfig.pending, (state) => {
        state.configStatus = 'loading'
        state.configError = null
      })
      .addCase(refreshMultisigConfig.fulfilled, (state, action) => {
        state.configStatus = 'succeeded'
        state.config = action.payload
      })
      .addCase(refreshMultisigConfig.rejected, (state, action) => {
        state.configStatus = 'failed'
        state.configError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load multisig config.'
      })
      .addCase(refreshMultisigProposals.pending, (state, action) => {
        state.listError = null
        markAdminListRequestPending(state, action.meta.requestId)

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = governanceListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.proposalsCache, cacheKey)
        const cached = state.proposalsCache[cacheKey] ?? []
        const nextStatus = filter.status ?? 'all'
        const nextOp = filter.operationType ?? 'all'
        const prevStatus = state.lastListFilter.status ?? 'all'
        const prevOp = state.lastListFilter.operationType ?? 'all'
        const filterChanged = nextStatus !== prevStatus || nextOp !== prevOp
        const useBackground = Boolean(background) || hasCache

        if (filterChanged) {
          state.lastListFilter = filter
          if (hasCache) {
            state.proposals = cached
            state.listStatus = 'succeeded'
          } else {
            state.proposals = []
            state.listStatus = 'loading'
          }
        } else if (useBackground) {
          state.listRefreshing = true
          return
        }

        if (useBackground) {
          state.listRefreshing = true
          return
        }

        state.listStatus = 'loading'
        if (!hasCache) {
          state.proposals = []
        }
      })
      .addCase(refreshMultisigProposals.fulfilled, (state, action) => {
        if (!isLatestAdminListRequest(state, action.meta.requestId)) return

        state.listRefreshing = false
        state.listStatus = 'succeeded'
        state.lastListFilter = action.payload.filter
        state.lastListUpdated = action.payload.fetchedAt

        const cacheKey = governanceListCacheKey(action.payload.filter)
        const activeKey = governanceListCacheKey(state.lastListFilter)
        const incoming = action.payload.proposals

        state.proposalsCache[cacheKey] = incoming

        if (cacheKey === activeKey && !governanceProposalListsEqual(state.proposals, incoming)) {
          state.proposals = incoming
        }
      })
      .addCase(refreshMultisigProposals.rejected, (state, action) => {
        state.listRefreshing = false

        const { background, ...filter } = action.meta.arg ?? {}
        const cacheKey = governanceListCacheKey(filter)
        const hasCache = Object.prototype.hasOwnProperty.call(state.proposalsCache, cacheKey)

        if (Boolean(background) || hasCache || state.proposals.length > 0) {
          state.listError =
            (typeof action.payload === 'string' ? action.payload : null) ??
            action.error.message ??
            'Could not refresh governance proposals.'
          return
        }

        state.listStatus = 'failed'
        state.listError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load governance proposals.'
      })
      .addCase(refreshMultisigProposalDetail.pending, (state, action) => {
        state.detailStatus = 'loading'
        state.detailError = null
        state.detailProposalId = action.meta.arg
      })
      .addCase(refreshMultisigProposalDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.detailsById[action.payload.id] = action.payload
      })
      .addCase(refreshMultisigProposalDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not load proposal detail.'
      })
      .addCase(signMultisigProposal.pending, (state, action) => {
        state.actionStatus = 'loading'
        state.actionError = null
        state.actionProposalId = action.meta.arg.proposalId
        state.actionKind = 'sign'
      })
      .addCase(signMultisigProposal.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionKind = null
      })
      .addCase(signMultisigProposal.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not submit signature.'
      })
      .addCase(executeMultisigProposal.pending, (state, action) => {
        state.actionStatus = 'loading'
        state.actionError = null
        state.actionProposalId = action.meta.arg
        state.actionKind = 'execute'
      })
      .addCase(executeMultisigProposal.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.actionKind = null
        state.lastExecuteOutcome = {
          kind: 'completed',
          status: 200,
          message: action.payload.result.message,
          txHash: action.payload.result.txHash || undefined,
          postExecuteSync: action.payload.result.postExecuteSync,
          raw: {},
        }
      })
      .addCase(executeMultisigProposal.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not execute proposal.'
      })
      .addCase(cancelMultisigProposal.pending, (state, action) => {
        state.actionStatus = 'loading'
        state.actionError = null
        state.actionProposalId = action.meta.arg
        state.actionKind = 'cancel'
      })
      .addCase(cancelMultisigProposal.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionKind = null
      })
      .addCase(cancelMultisigProposal.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Could not cancel proposal.'
      })
  },
})

export const { resetAdminMultisig, clearAdminMultisigActionError, clearLastExecuteOutcome } =
  adminMultisigSlice.actions
export const adminMultisigReducer = adminMultisigSlice.reducer

export function selectMultisigProposalDetail(
  state: AdminMultisigState,
  proposalId: string,
): ProposalDetail | null {
  return state.detailsById[proposalId] ?? null
}

export function hasActiveGovernanceProposals(proposals: ProposalListRow[]): boolean {
  return proposals.some((p) => p.status === 'pending_signatures' || p.status === 'ready')
}
