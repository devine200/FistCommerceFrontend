import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  displayDashboardMetricString,
  displayDashboardPercentString,
  formatDashboardCompactUsd,
  formatDashboardPercentMetric,
  formatDashboardPlainAmount,
  fetchInvestorMetrics,
  fetchPoolMetrics,
  type InvestorMetrics,
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
  investorMetrics: InvestorMetrics | null
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
  investorMetrics: null,
  status: 'idle',
  error: null,
  lastUpdated: null,
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function formatUsdLike(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return formatDashboardCompactUsd(value)
  if (typeof value === 'string' && value.trim()) return displayDashboardMetricString(value.trim())
  return null
}

function formatPercentLike(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return formatDashboardPercentMetric(value)
  if (typeof value === 'string' && value.trim()) return displayDashboardPercentString(value.trim())
  return null
}

function extractPoolItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const rec = asRecord(payload)
  const maybe = rec?.results ?? rec?.data ?? rec?.pools ?? rec?.items
  if (Array.isArray(maybe)) return maybe

  const looksLikeSinglePool =
    typeof rec?.slug === 'string' ||
    typeof rec?.pool_slug === 'string' ||
    typeof rec?.id === 'string' ||
    typeof rec?.poolId === 'string' ||
    typeof rec?.pool_id === 'string'
  return looksLikeSinglePool ? [payload] : []
}

// NOTE: Single-pool UX — keep one default pool card and only hydrate a few fields from API metrics.

function pickPoolMetricsForDefaultCard(payload: unknown, defaultPoolId: string): Record<string, unknown> | null {
  const items = extractPoolItems(payload)
  if (!items.length) return null
  for (const item of items) {
    const rec = asRecord(item)
    if (!rec) continue
    const idRaw = rec.slug ?? rec.pool_slug ?? rec.id ?? rec.poolId ?? rec.pool_id ?? rec.poolSlug
    const id = typeof idRaw === 'string' ? idRaw.trim() : ''
    if (id && id === defaultPoolId) return rec
  }
  return asRecord(items[0]) ?? null
}

function patchCardFromPoolMetrics(card: LendingPoolCardState, pool: Record<string, unknown>): LendingPoolCardState {
  const apy =
    formatPercentLike(pool.apy) ??
    formatPercentLike(pool.apy_percent) ??
    formatPercentLike(pool.apy_percentage) ??
    formatPercentLike(pool.avg_apy) ??
    formatPercentLike(pool.average_apy) ??
    formatPercentLike(pool.average_apy_percent) ??
    formatPercentLike(pool.average_apy_percentage)

  const tvl =
    formatUsdLike(pool.tvl) ??
    formatUsdLike(pool.tvl_usd) ??
    formatUsdLike(pool.total_value_locked) ??
    formatUsdLike(pool.total_value_locked_usd)

  const minDeposit =
    formatUsdLike(pool.minimum_deposit) ??
    formatUsdLike(pool.minimum_deposit_amount) ??
    formatUsdLike(pool.minDeposit) ??
    formatUsdLike(pool.min_deposit) ??
    formatUsdLike(pool.min_deposit_amount)

  const utilization =
    formatPercentLike(pool.utilization) ??
    formatPercentLike(pool.utilization_rate) ??
    formatPercentLike(pool.utilization_percent) ??
    formatPercentLike(pool.utilization_percentage)

  return {
    ...card,
    apyDisplay: apy ? (apy.includes('APY') ? apy : `${apy} APY`) : card.apyDisplay,
    tvlDisplay: tvl ? (tvl.includes('USDC') || tvl.includes('USDT') ? tvl : `${tvl} USDC`) : card.tvlDisplay,
    minDepositDisplay: minDeposit
      ? minDeposit.includes('USDC') || minDeposit.includes('USDT')
        ? minDeposit
        : `${minDeposit} USDC`
      : card.minDepositDisplay,
    utilizationDisplay: utilization
      ? utilization.toLowerCase().includes('allocated')
        ? utilization
        : `${utilization} Allocated`
      : card.utilizationDisplay,
  }
}

function extractTotalDepositedDisplay(payload: unknown): string | null {
  const rec = asRecord(payload)
  const raw =
    rec?.total_deposited ??
    rec?.totalDeposited ??
    rec?.total_deposits ??
    rec?.totalDeposits ??
    rec?.total ??
    rec?.total_amount
  if (typeof raw === 'number' && Number.isFinite(raw)) return formatDashboardPlainAmount(raw)
  if (typeof raw === 'string' && raw.trim()) return displayDashboardMetricString(raw.trim())
  return null
}

export const refreshMerchantDashboard = createAsyncThunk(
  'merchantDashboard/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as { auth?: { accessToken?: string | null } }
    const accessToken = state.auth?.accessToken
    const [poolMetrics, investorMetrics] = await Promise.all([
      fetchPoolMetrics(accessToken),
      fetchInvestorMetrics(accessToken),
    ])
    return { refreshedAt: Date.now(), poolMetrics, investorMetrics }
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
        state.investorMetrics = action.payload.investorMetrics

        // Single pool UX: keep default card + hydrate its metrics from the API response.
        const current = state.lendingPools
        if (current) {
          const pool = pickPoolMetricsForDefaultCard(action.payload.poolMetrics, current.id)
          if (pool) state.lendingPools = patchCardFromPoolMetrics(current, pool)
        }

        const total = extractTotalDepositedDisplay(action.payload.investorMetrics)
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
