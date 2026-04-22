import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Captured at investor verify-identity; submitted at last onboarding step. Not persisted. */
export type InvestorOnboardingProfileDraft = {
  first_name: string
  last_name: string
  phone: string
  email: string
  country: string
  date_of_birth: string
}

export type MerchantIdentityDraft = {
  full_name: string
  phone: string
  email: string
}

export type MerchantBusinessDraft = {
  business_name: string
  industry: string
  country_of_registration: string
  business_address: string
  years_in_operation: number
  business_website: string
}

export type OnboardingProfileDraftState = {
  investor: InvestorOnboardingProfileDraft | null
  merchantIdentity: MerchantIdentityDraft | null
  merchantBusiness: MerchantBusinessDraft | null
}

const initialState: OnboardingProfileDraftState = {
  investor: null,
  merchantIdentity: null,
  merchantBusiness: null,
}

const onboardingProfileDraftSlice = createSlice({
  name: 'onboardingProfileDraft',
  initialState,
  reducers: {
    setInvestorOnboardingProfileDraft: (state, action: PayloadAction<InvestorOnboardingProfileDraft>) => {
      state.investor = action.payload
    },
    setMerchantIdentityDraft: (state, action: PayloadAction<MerchantIdentityDraft>) => {
      state.merchantIdentity = action.payload
    },
    setMerchantBusinessDraft: (state, action: PayloadAction<MerchantBusinessDraft>) => {
      state.merchantBusiness = action.payload
    },
    resetOnboardingProfileDrafts: () => initialState,
  },
})

export const {
  setInvestorOnboardingProfileDraft,
  setMerchantIdentityDraft,
  setMerchantBusinessDraft,
  resetOnboardingProfileDrafts,
} = onboardingProfileDraftSlice.actions
export const onboardingProfileDraftReducer = onboardingProfileDraftSlice.reducer
