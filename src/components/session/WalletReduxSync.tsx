import { useEffect, useRef } from 'react'
import { useConnection } from 'wagmi'

import { resetUserSession } from '@/session/resetUserSession'
import { store } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { setWalletFromProvider } from '@/store/slices/walletSlice'

/**
 * Keeps Redux wallet mirror in sync with wagmi; clears session on disconnect.
 * Uses full reload after reset so no route is left mid-guard without a Router navigate.
 */
export default function WalletReduxSync() {
  const dispatch = useAppDispatch()
  const { status, address, chainId } = useConnection()
  useEffect(() => {
    const { onboarded, accessToken } = store.getState().auth
    if (onboarded && !accessToken?.length) {
      dispatch(patchAuth({ accessToken: 'migrated_session' }))
    }
  }, [dispatch])

  useEffect(() => {
    const connected = status === 'connected'
    dispatch(
      setWalletFromProvider({
        isConnected: connected,
        address: address ?? null,
        chainId,
      }),
    )
  }, [dispatch, status, address, chainId])

  const wasConnected = useRef(false)
  useEffect(() => {
    const connected = status === 'connected'
    if (wasConnected.current && !connected) {
      resetUserSession(dispatch)
      window.location.replace('/onboarding/choose-role')
    }
    wasConnected.current = connected
  }, [dispatch, status])

  return null
}
