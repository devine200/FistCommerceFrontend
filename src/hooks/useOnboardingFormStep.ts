import { useAppDispatch } from '@/store/hooks'
import { clearOnboardingStepDirty, setOnboardingStepDirty } from '@/store/slices/onboardingSlice'
import type { UserRole } from '@/store/slices/authSlice'

/**
 * Marks this onboarding step as having unsaved edits (blocks jumping forward by URL until submit).
 * Call `clearStepDirty()` after a successful Continue so the guard allows the next step.
 */
export function useOnboardingFormStep(role: UserRole, stepIndex: number) {
  const dispatch = useAppDispatch()

  const formMonitorProps = {
    onInput: () => {
      dispatch(setOnboardingStepDirty({ role, stepIndex, dirty: true }))
    },
  } as const

  const clearStepDirty = () => {
    dispatch(clearOnboardingStepDirty({ role, stepIndex }))
  }

  return { formMonitorProps, clearStepDirty }
}
