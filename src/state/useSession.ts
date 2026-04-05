import { useAppSelector } from '@/store/hooks'

export function useSession() {
  return useAppSelector((state) => state.auth)
}
