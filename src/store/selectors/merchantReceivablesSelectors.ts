import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import type { MerchantReceivablesState } from '@/store/slices/merchantReceivablesSlice'
import { mapLoanDetailsToMerchantLoanTableRow, mapLoanDetailsToReceivableTableRow } from '@/utils/mapLoanDetailsToReceivableDetailView'

const MISSING_RECEIVABLES_STATE: MerchantReceivablesState = {
  loans: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
}

/** Falls back if the slice is missing (e.g. circular import left the reducer unregistered). */
const selectMerchantReceivablesState = (state: RootState) =>
  state.merchantReceivables ?? MISSING_RECEIVABLES_STATE

export const selectMerchantReceivablesStatus = createSelector(
  selectMerchantReceivablesState,
  (s) => s.status,
)

export const selectMerchantReceivablesError = createSelector(
  selectMerchantReceivablesState,
  (s) => s.error,
)

const selectMerchantLoanEntries = createSelector(selectMerchantReceivablesState, (s) => s.loans ?? [])

const selectHasLoadedMerchantLoans = createSelector(
  selectMerchantReceivablesStatus,
  (status) => status === 'succeeded',
)

function navigableLoanId(entry: { loanId: string; loanRequestId: string | null }): string {
  return entry.loanRequestId ?? entry.loanId
}

export const selectReceivableTableRows = createSelector(
  selectMerchantLoanEntries,
  selectHasLoadedMerchantLoans,
  (loans, loaded) =>
    loaded
      ? loans.map((entry) => mapLoanDetailsToReceivableTableRow(navigableLoanId(entry), entry.details))
      : [],
)

export const selectMerchantLoanTableRows = createSelector(
  selectMerchantLoanEntries,
  selectHasLoadedMerchantLoans,
  (loans, loaded) =>
    loaded
      ? loans.map((entry) => mapLoanDetailsToMerchantLoanTableRow(navigableLoanId(entry), entry.details))
      : [],
)
