import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  displayDashboardMetricString,
  displayPoolApyPercent,
  displayPoolMinDeposit,
  displayPoolUtilization,
  formatDashboardPlainAmount,
  fetchMerchantMetrics,
  fetchPoolMetrics,
  type MerchantMetrics,
  type PoolMetrics,
} from '@/api/metrics'
import type { LendingPoolCardState } from '@/store/slices/investorDashboardSlice'

export type MerchantDashboardSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MerchantDashboardState = {
  walletDisplay: string
  totalDepositsDisplay: string
  lendingPools: LendingPoolCardState
  /** Raw API payloads (used by detail pages for richer info). */
  poolMetrics: PoolMetrics | null
  merchantMetrics: MerchantMetrics | null
  status: MerchantDashboardSyncStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: MerchantDashboardState = {
  walletDisplay: '0x7A3F...92C1',
  totalDepositsDisplay: '538,500',
  lendingPools: {
    id: 'fist-commerce-lending-pool',
    viewDetailsTo: '/dashboard/merchant/lending-pool/fist-commerce-lending-pool',
    poolTitle: 'Fist Commerce Lending Pool',
    tagline: 'For short-duration loans with stable returns.',
    apyDisplay: '6-8% APY',
    tvlDisplay: '538,500 USDC',
    minDepositDisplay: '100 USDC',
    utilizationDisplay: '60% Allocated',
  },
  poolMetrics: null,
  merchantMetrics: null,
  status: 'idle',
  error: null,
  lastUpdated: null,
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function extractTotalDepositedDisplay(payload: unknown): string | null {
  const rec = asRecord(payload)
  const credit = rec && typeof rec.credit === 'object' && rec.credit ? (rec.credit as Record<string, unknown>) : null
  const raw = credit?.totalBorrowed ?? credit?.total_borrowed
  if (typeof raw === 'number' && Number.isFinite(raw)) return formatDashboardPlainAmount(raw)
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number(raw.trim().replace(/,/g, ''))
    if (Number.isFinite(n)) return formatDashboardPlainAmount(n)
    return raw.trim()
  }
  return null
}

export const refreshMerchantDashboard = createAsyncThunk(
  'merchantDashboard/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as { auth?: { accessToken?: string | null } }
    const accessToken = state.auth?.accessToken
    const [poolMetrics, merchantMetrics] = await Promise.all([
      fetchPoolMetrics(accessToken),
      fetchMerchantMetrics(accessToken),
    ])
    return { refreshedAt: Date.now(), poolMetrics, merchantMetrics }
  },
)

const merchantDashboardSlice = createSlice({
  name: 'merchantDashboard',
  initialState,
  reducers: {
    setMerchantWalletDisplay: (state, action: PayloadAction<string>) => {
      state.walletDisplay = action.payload
    },
    setMerchantTotalDepositsDisplay: (state, action: PayloadAction<string>) => {
      state.totalDepositsDisplay = action.payload
    },
    setMerchantLendingPools: (state, action: PayloadAction<LendingPoolCardState>) => {
      state.lendingPools = action.payload
    },
    patchMerchantPool: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<LendingPoolCardState> }>,
    ) => {
      if (state.lendingPools.id === action.payload.id) {
        Object.assign(state.lendingPools, action.payload.patch)
      }
    },
    resetMerchantDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMerchantDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshMerchantDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastUpdated = action.payload.refreshedAt
        state.poolMetrics = action.payload.poolMetrics
        state.merchantMetrics = action.payload.merchantMetrics

        const pool = action.payload.poolMetrics
        const tvl = pool ? displayDashboardMetricString(pool.tvl) : null
        const util = pool ? displayPoolUtilization(pool.utilization) : null
        const minDep = pool ? displayPoolMinDeposit(pool.minDeposit) : null
        const apy = pool ? displayPoolApyPercent(pool.apy) : null

        state.lendingPools = {
          ...state.lendingPools,
          tvlDisplay: tvl && tvl !== '—' ? tvl : state.lendingPools.tvlDisplay,
          utilizationDisplay:
            util && util !== '—' ? (util.toLowerCase().includes('allocated') ? util : `${util} Allocated`) : state.lendingPools.utilizationDisplay,
          minDepositDisplay: minDep && minDep !== '—' ? `$${minDep}` : state.lendingPools.minDepositDisplay,
          apyDisplay: apy && apy !== '—' ? (apy.includes('APY') ? apy : `${apy} APY`) : state.lendingPools.apyDisplay,
        }
        const total = extractTotalDepositedDisplay(action.payload.merchantMetrics)
        if (total) state.totalDepositsDisplay = total
      })
      .addCase(refreshMerchantDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Refresh failed'
      })
  },
})

export const {
  setMerchantWalletDisplay,
  setMerchantTotalDepositsDisplay,
  setMerchantLendingPools,
  patchMerchantPool,
  resetMerchantDashboard,
} = merchantDashboardSlice.actions
export const merchantDashboardReducer = merchantDashboardSlice.reducer
