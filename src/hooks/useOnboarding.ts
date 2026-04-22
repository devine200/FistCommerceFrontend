import { useAppSelector } from '@/store/hooks'

export function useOnboarding() {
  return useAppSelector((s) => s.onboarding)
}
