import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import type { AccessContext } from '@/access/types'
import { useAppSelector } from '@/store/hooks'
import { selectIsPersistReady } from '@/store/selectors/sessionSelectors'
import { useActiveWallet } from '@/wallet/useActiveWallet'

/** Snapshot of route + auth + wallet + KYC used by access evaluators */
export function useAccessContext(): AccessContext {
  const location = useLocation()
  const { isConnected, address } = useActiveWallet()
  const status = isConnected ? 'connected' : 'disconnected'
  const auth = useAppSelector((s) => s.auth)
  const onboarding = useAppSelector((s) => s.onboarding)
  const kycStatus = useAppSelector((s) => s.kyc.status)
  const persistedReady = useAppSelector(selectIsPersistReady)

  return useMemo(
    () => ({
      pathname: location.pathname,
      persistedReady,
      role: auth.role,
      onboarded: auth.onboarded,
      accessToken: auth.accessToken,
      walletStatus: status,
      walletConnected: status === 'connected',
      walletAddress: address ?? null,
      kycStatus,
      onboardingMaxStep: {
        investor: onboarding.investorMaxStep,
        merchant: onboarding.merchantMaxStep,
      },
      onboardingStepDirty: {
        investor: onboarding.investorStepDirty,
        merchant: onboarding.merchantStepDirty,
      },
    }),
    [
      location.pathname,
      persistedReady,
      auth.role,
      auth.onboarded,
      auth.accessToken,
      status,
      address,
      kycStatus,
      onboarding.investorMaxStep,
      onboarding.merchantMaxStep,
      onboarding.investorStepDirty,
      onboarding.merchantStepDirty,
    ],
  )
}
