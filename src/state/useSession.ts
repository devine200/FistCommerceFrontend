import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import { useAppSelector } from '@/store/hooks'

/** Session + effective KYC (merges kyc slice + legacy auth.kycVerified). */
export function useSession() {
  const auth = useAppSelector((s) => s.auth)
  const kycVerified = useAppSelector(selectIsKycVerified)
  return {
    ...auth,
    kycVerified,
  }
}
