import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { UserRole } from '@/store/slices/authSlice'

/**
 * `investorMaxStep` / `merchantMaxStep`: highest step index (0…3) the user may open — advances only after each step’s Continue/submit.
 * `*StepDirty`: unsaved edits on form-backed steps; blocks jumping forward by URL until the step is submitted again.
 */
export type OnboardingSliceState = {
  investorMaxStep: number
  merchantMaxStep: number
  investorStepDirty: Record<string, boolean>
  merchantStepDirty: Record<string, boolean>
}

const initialState: OnboardingSliceState = {
  investorMaxStep: 0,
  merchantMaxStep: 0,
  investorStepDirty: {},
  merchantStepDirty: {},
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    unlockOnboardingStep: (state, action: PayloadAction<{ role: UserRole; stepIndex: number }>) => {
      const { role, stepIndex } = action.payload
      if (role === 'investor') {
        state.investorMaxStep = Math.max(state.investorMaxStep, stepIndex)
      } else {
        state.merchantMaxStep = Math.max(state.merchantMaxStep, stepIndex)
      }
    },
    /** Returning user / login API: allow full flow without step locks */
    unlockAllOnboardingSteps: (state, action: PayloadAction<UserRole | undefined>) => {
      const role = action.payload
      if (!role || role === 'investor') {
        state.investorMaxStep = 3
        state.investorStepDirty = {}
      }
      if (!role || role === 'merchant') {
        state.merchantMaxStep = 3
        state.merchantStepDirty = {}
      }
    },
    resetOnboardingProgress: () => initialState,
    setOnboardingStepDirty: (
      state,
      action: PayloadAction<{ role: UserRole; stepIndex: number; dirty: boolean }>,
    ) => {
      const { role, stepIndex, dirty } = action.payload
      const key = String(stepIndex)
      if (role === 'investor') {
        if (dirty) state.investorStepDirty[key] = true
        else delete state.investorStepDirty[key]
      } else {
        if (dirty) state.merchantStepDirty[key] = true
        else delete state.merchantStepDirty[key]
      }
    },
    clearOnboardingStepDirty: (state, action: PayloadAction<{ role: UserRole; stepIndex: number }>) => {
      const { role, stepIndex } = action.payload
      const key = String(stepIndex)
      if (role === 'investor') delete state.investorStepDirty[key]
      else delete state.merchantStepDirty[key]
    },
  },
})

export const {
  unlockOnboardingStep,
  unlockAllOnboardingSteps,
  resetOnboardingProgress,
  setOnboardingStepDirty,
  clearOnboardingStepDirty,
} = onboardingSlice.actions
export const onboardingReducer = onboardingSlice.reducer
