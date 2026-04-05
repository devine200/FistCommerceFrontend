import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  getAdminInvestorsInitialState,
  resolveInvestmentActivityDetail,
  type AdminInvestorsDataState,
  type InvestmentActivityDetail,
  type InvestmentDetailFields,
  type InvestorProfileDetail,
  type InvestorTableRow,
} from '@/components/admin/investors/investorsMockData'

const initialState: AdminInvestorsDataState = getAdminInvestorsInitialState()

const adminInvestorsSlice = createSlice({
  name: 'adminInvestors',
  initialState,
  reducers: {
    setInvestorTableRows: (state, action: PayloadAction<InvestorTableRow[]>) => {
      state.tableRows = action.payload
    },
    setInvestorProfile: (state, action: PayloadAction<InvestorProfileDetail>) => {
      state.profilesById[action.payload.id] = action.payload
    },
    patchInvestorProfile: (
      state,
      action: PayloadAction<{ investorId: string; patch: Partial<InvestorProfileDetail> }>,
    ) => {
      const cur = state.profilesById[action.payload.investorId]
      if (!cur) return
      Object.assign(cur, action.payload.patch)
    },
    patchInvestmentRecordDetail: (
      state,
      action: PayloadAction<{ recordId: string; fields: InvestmentDetailFields }>,
    ) => {
      state.investmentRecordDetails[action.payload.recordId] = action.payload.fields
    },
    setInvestmentRecordDetails: (
      state,
      action: PayloadAction<Record<string, InvestmentDetailFields>>,
    ) => {
      state.investmentRecordDetails = action.payload
    },
    resetAdminInvestors: () => getAdminInvestorsInitialState(),
  },
})

export const {
  setInvestorTableRows,
  setInvestorProfile,
  patchInvestorProfile,
  patchInvestmentRecordDetail,
  setInvestmentRecordDetails,
  resetAdminInvestors,
} = adminInvestorsSlice.actions

export const adminInvestorsReducer = adminInvestorsSlice.reducer

export type AdminInvestorsState = AdminInvestorsDataState

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
