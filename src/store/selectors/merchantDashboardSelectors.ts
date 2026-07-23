import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import {
  merchantDashboardInitialState,
  type MerchantDashboardState,
} from '@/store/slices/merchantDashboardSlice'

/**
 * Falls back if the slice is missing (corrupt store / deploy mismatch).
 * Prefer field / view selectors below so components do not re-render on unrelated slice updates.
 */
export function selectMerchantDashboard(state: RootState): MerchantDashboardState {
  return state.merchantDashboard ?? merchantDashboardInitialState
}

export function selectMerchantDashboardStatus(state: RootState) {
  return selectMerchantDashboard(state).status
}

export function selectMerchantDashboardError(state: RootState) {
  return selectMerchantDashboard(state).error
}

export function selectMerchantWalletDisplay(state: RootState) {
  return selectMerchantDashboard(state).walletDisplay
}

export function selectMerchantLendingPools(state: RootState) {
  return selectMerchantDashboard(state).lendingPools
}

export function selectMerchantLendingPoolTitle(state: RootState) {
  return selectMerchantLendingPools(state).poolTitle
}

export function selectMerchantPoolMetrics(state: RootState) {
  return selectMerchantDashboard(state).poolMetrics
}

export function selectMerchantMetrics(state: RootState) {
  return selectMerchantDashboard(state).merchantMetrics
}

/** Profile overview fields — ignores status/wallet churn. */
export const selectMerchantProfileOverview = createSelector(
  selectMerchantMetrics,
  selectMerchantPoolMetrics,
  selectMerchantLendingPools,
  (merchantMetrics, poolMetrics, lendingPools) => ({
    merchantMetrics,
    poolMetrics,
    lendingPools,
  }),
)
