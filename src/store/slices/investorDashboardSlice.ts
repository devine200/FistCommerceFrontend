import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  displayDashboardCompactUsd,
  displayPoolApyPercent,
  displayPoolUtilization,
  fetchInvestorMetrics,
  fetchPoolMetrics,
  type InvestorMetrics,
  type PoolMetrics,
} from '@/api/metrics'
import { deriveKycStatusFromInvestorRecord, fetchInvestorKycRecord } from '@/api/kycInvestor'
import { fetchRecentPayoutTransactions, type RecentPayoutBundle } from '@/api/payout'
import { patchAuth, type UserRole } from '@/store/slices/authSlice'
import { setInvestorKycRecord, setKycStatus } from '@/store/slices/kycSlice'
import { setRecentPayoutBundle } from '@/store/slices/recentTransactionsSlice'

export type LendingPoolCardState = {
  id: string
  viewDetailsTo: string
  poolTitle: string
  tagline?: string
  apyDisplay?: string
  tvlDisplay?: string
  liquidAssetsDisplay?: string
  outstandingDisplay?: string
  availableLiquidityDisplay?: string
  minDepositDisplay?: string
  utilizationDisplay?: string
}

export type InvestorDashboardSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type InvestorDashboardState = {
  walletDisplay: string
  lendingPools: LendingPoolCardState
  /** Raw API payloads (used by detail pages for richer info). */
  poolMetrics: PoolMetrics | null
  investorMetrics: InvestorMetrics | null
  status: InvestorDashboardSyncStatus
  error: string | null
  lastUpdated: number | null
}

const initialState: InvestorDashboardState = {
  walletDisplay: '0x7A3F...92C1',
  lendingPools: {
    id: 'fist-commerce-lending-pool',
    viewDetailsTo: '/dashboard/investor/lending-pool/fist-commerce-lending-pool',
    poolTitle: 'Fist Commerce Lending Pool',
    tagline: 'For short-duration loans with stable returns.',
    apyDisplay: '6-8% APY',
    tvlDisplay: '$538.50K',
    minDepositDisplay: '$100.00',
    utilizationDisplay: '60% Allocated',
  },
  poolMetrics: null,
  investorMetrics: null,
  status: 'idle',
  error: null,
  lastUpdated: null,
}

// NOTE: Single-pool UX — keep one default pool card and only hydrate a few fields from API metrics.

function patchCardFromPoolMetrics(card: LendingPoolCardState, pool: PoolMetrics): LendingPoolCardState {
  const apy = displayPoolApyPercent(pool.apy)
  const tvl = displayDashboardCompactUsd(pool.tvl)
  const liquid = displayDashboardCompactUsd(pool.liquidAssets)
  const outstanding = displayDashboardCompactUsd(pool.outstanding)
  const available = displayDashboardCompactUsd(pool.availableLiquidity)
  const minDeposit = displayDashboardCompactUsd(pool.minDeposit)
  const utilization = displayPoolUtilization(pool.utilization)

  return {
    ...card,
    apyDisplay: apy !== '—' ? (apy.includes('APY') ? apy : `${apy} APY`) : card.apyDisplay,
    tvlDisplay: tvl !== '—' ? tvl : card.tvlDisplay,
    liquidAssetsDisplay: liquid !== '—' ? liquid : card.liquidAssetsDisplay,
    outstandingDisplay: outstanding !== '—' ? outstanding : card.outstandingDisplay,
    availableLiquidityDisplay: available !== '—' ? available : card.availableLiquidityDisplay,
    minDepositDisplay: minDeposit !== '—' ? minDeposit : card.minDepositDisplay,
    utilizationDisplay:
      utilization !== '—'
        ? utilization.toLowerCase().includes('allocated')
          ? utilization
          : `${utilization} Allocated`
        : card.utilizationDisplay,
  }
}

type RefreshInvestorAuth = {
  auth?: { accessToken?: string | null; role?: UserRole | null }
}

const emptyRecentPayout: RecentPayoutBundle = {
  transactions: [],
  contractAddress: null,
  explorerBaseUrl: null,
}

export const refreshInvestorDashboard = createAsyncThunk(
  'investorDashboard/refresh',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as RefreshInvestorAuth
    const accessToken = state.auth?.accessToken
    const role = state.auth?.role
    let kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected' | null = null
    if (role === 'investor' && accessToken?.trim()) {
      try {
        const kycRecord = await fetchInvestorKycRecord(accessToken)
        kycStatus = deriveKycStatusFromInvestorRecord(kycRecord)
        thunkApi.dispatch(setInvestorKycRecord(kycRecord))
      } catch {
        kycStatus = 'not_started'
        thunkApi.dispatch(setInvestorKycRecord(null))
      }
      thunkApi.dispatch(setKycStatus(kycStatus))
      thunkApi.dispatch(patchAuth({ kycVerified: kycStatus === 'verified' }))
    }

    const isKycVerified = kycStatus === 'verified'

    // Hard gate: never fetch dashboard metrics / payout history unless KYC is verified.
    const [poolMetrics, investorMetrics, recentPayout] = isKycVerified
      ? await Promise.all([
          fetchPoolMetrics(accessToken),
          fetchInvestorMetrics(accessToken),
          fetchRecentPayoutTransactions(accessToken).catch(() => emptyRecentPayout),
        ])
      : ([null, null, emptyRecentPayout] as const)

    const refreshedAt = Date.now()
    thunkApi.dispatch(setRecentPayoutBundle({ bundle: recentPayout, fetchedAt: refreshedAt }))

    return { refreshedAt, poolMetrics, investorMetrics }
  },
)

const investorDashboardSlice = createSlice({
  name: 'investorDashboard',
  initialState,
  reducers: {
    setInvestorWalletDisplay: (state, action: PayloadAction<string>) => {
      state.walletDisplay = action.payload
    },
    setInvestorLendingPools: (state, action: PayloadAction<LendingPoolCardState>) => {
      state.lendingPools = action.payload
    },
    patchInvestorPool: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<LendingPoolCardState> }>,
    ) => {
      if (state.lendingPools.id === action.payload.id) {
        Object.assign(state.lendingPools, action.payload.patch)
      }
    },
    resetInvestorDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshInvestorDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshInvestorDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastUpdated = action.payload.refreshedAt
        state.poolMetrics = action.payload.poolMetrics
        state.investorMetrics = action.payload.investorMetrics

        // Single pool UX: keep default card + hydrate its metrics from the API response.
        const current = state.lendingPools
        if (action.payload.poolMetrics) {
          state.lendingPools = patchCardFromPoolMetrics(current, action.payload.poolMetrics)
        }
      })
      .addCase(refreshInvestorDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'Refresh failed'
      })
  },
})

export const {
  setInvestorWalletDisplay,
  setInvestorLendingPools,
  patchInvestorPool,
  resetInvestorDashboard,
} = investorDashboardSlice.actions
export const investorDashboardReducer = investorDashboardSlice.reducer
