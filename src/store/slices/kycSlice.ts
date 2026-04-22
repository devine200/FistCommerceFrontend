import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected'

export type KycSliceState = {
  status: KycStatus
}

const initialState: KycSliceState = {
  status: 'verified',
}

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setKycStatus: (state, action: PayloadAction<KycStatus>) => {
      state.status = action.payload
    },
    resetKyc: () => initialState,
  },
})

export const { setKycStatus, resetKyc } = kycSlice.actions
export const kycReducer = kycSlice.reducer
