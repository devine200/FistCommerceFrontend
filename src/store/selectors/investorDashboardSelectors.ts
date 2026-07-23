import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import {
  investorDashboardInitialState,
  type InvestorDashboardState,
} from '@/store/slices/investorDashboardSlice'

/**
 * Falls back if the slice is missing (corrupt store / deploy mismatch).
 * Prefer field / view selectors below so components do not re-render on unrelated slice updates.
 */
export function selectInvestorDashboard(state: RootState): InvestorDashboardState {
  return state.investorDashboard ?? investorDashboardInitialState
}

export function selectInvestorDashboardStatus(state: RootState) {
  return selectInvestorDashboard(state).status
}

export function selectInvestorDashboardError(state: RootState) {
  return selectInvestorDashboard(state).error
}

export function selectInvestorWalletDisplay(state: RootState) {
  return selectInvestorDashboard(state).walletDisplay
}

export function selectInvestorLendingPools(state: RootState) {
  return selectInvestorDashboard(state).lendingPools
}

export function selectInvestorPoolMetrics(state: RootState) {
  return selectInvestorDashboard(state).poolMetrics
}

export function selectInvestorMetrics(state: RootState) {
  return selectInvestorDashboard(state).investorMetrics
}

/** Pool card + metrics only — ignores status/wallet churn. */
export const selectInvestorPoolAndMetrics = createSelector(
  selectInvestorLendingPools,
  selectInvestorPoolMetrics,
  selectInvestorMetrics,
  (lendingPools, poolMetrics, investorMetrics) => ({
    lendingPools,
    poolMetrics,
    investorMetrics,
  }),
)

/** Detail/layout fields used together on pool detail pages. */
export const selectInvestorPoolDetailView = createSelector(
  selectInvestorLendingPools,
  selectInvestorPoolMetrics,
  selectInvestorMetrics,
  selectInvestorDashboardStatus,
  selectInvestorDashboardError,
  selectInvestorWalletDisplay,
  (lendingPools, poolMetrics, investorMetrics, status, error, walletDisplay) => ({
    lendingPools,
    poolMetrics,
    investorMetrics,
    status,
    error,
    walletDisplay,
  }),
)
