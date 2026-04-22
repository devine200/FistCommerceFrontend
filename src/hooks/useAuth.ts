import { useAppSelector } from '@/store/hooks'

export function useAuth() {
  return useAppSelector((s) => s.auth)
}
