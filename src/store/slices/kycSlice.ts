import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { InvestorKycRecord } from '@/api/kycInvestor'
import type { MerchantKycRecord } from '@/api/kycMerchant'

export type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected'

export type KycSliceState = {
  status: KycStatus
  /** Latest GET snapshot for investor KYC UI (not persisted). */
  investorKycRecord: InvestorKycRecord | null
  /** Latest GET snapshot for merchant KYC UI (not persisted). */
  merchantKycRecord: MerchantKycRecord | null
}

const initialState: KycSliceState = {
  status: 'not_started',
  investorKycRecord: null,
  merchantKycRecord: null,
}

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setKycStatus: (state, action: PayloadAction<KycStatus>) => {
      state.status = action.payload
    },
    setInvestorKycRecord: (state, action: PayloadAction<InvestorKycRecord | null>) => {
      state.investorKycRecord = action.payload
    },
    setMerchantKycRecord: (state, action: PayloadAction<MerchantKycRecord | null>) => {
      state.merchantKycRecord = action.payload
    },
    resetKyc: () => initialState,
  },
})

export const { setKycStatus, setInvestorKycRecord, setMerchantKycRecord, resetKyc } = kycSlice.actions
export const kycReducer = kycSlice.reducer
