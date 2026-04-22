import { selectIsKycVerified, selectKycStatus } from '@/store/selectors/sessionSelectors'
import { useAppSelector } from '@/store/hooks'

export function useKYC() {
  const status = useAppSelector(selectKycStatus)
  const isVerified = useAppSelector(selectIsKycVerified)
  return { status, isVerified }
}
