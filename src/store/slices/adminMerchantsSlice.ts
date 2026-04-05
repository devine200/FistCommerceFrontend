import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  getAdminMerchantsInitialState,
  type AdminMerchantsDataState,
  type MerchantProfileDetail,
  type MerchantTableRow,
} from '@/components/admin/merchants/merchantsMockData'

const initialState: AdminMerchantsDataState = getAdminMerchantsInitialState()

const adminMerchantsSlice = createSlice({
  name: 'adminMerchants',
  initialState,
  reducers: {
    setMerchantTableRows: (state, action: PayloadAction<MerchantTableRow[]>) => {
      state.tableRows = action.payload
    },
    setMerchantProfile: (state, action: PayloadAction<MerchantProfileDetail>) => {
      state.profilesById[action.payload.id] = action.payload
    },
    patchMerchantProfile: (
      state,
      action: PayloadAction<{ merchantId: string; patch: Partial<MerchantProfileDetail> }>,
    ) => {
      const cur = state.profilesById[action.payload.merchantId]
      if (!cur) return
      Object.assign(cur, action.payload.patch)
    },
    resetAdminMerchants: () => getAdminMerchantsInitialState(),
  },
})

export const {
  setMerchantTableRows,
  setMerchantProfile,
  patchMerchantProfile,
  resetAdminMerchants,
} = adminMerchantsSlice.actions

export const adminMerchantsReducer = adminMerchantsSlice.reducer

export type AdminMerchantsState = AdminMerchantsDataState

export function selectMerchantProfile(
  state: AdminMerchantsState,
  merchantId: string,
): MerchantProfileDetail | null {
  return state.profilesById[merchantId] ?? null
}
