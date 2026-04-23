import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import { resetUserSession } from '@/session/resetUserSession'
import { store } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { setWalletFromProvider } from '@/store/slices/walletSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'

const AGENT_DEBUG_INGEST =
  import.meta.env.DEV ? '/ingest/fb9c849e-37ad-4a71-b70c-257ccd07e08d' : ''

function agentDebugLog(payload: Record<string, unknown>) {
  if (!AGENT_DEBUG_INGEST) return
  fetch(AGENT_DEBUG_INGEST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'eda03a',
    },
    body: JSON.stringify({ sessionId: 'eda03a', ...payload }),
  }).catch(() => {})
}

/**
 * Keeps Redux wallet mirror in sync with Privy; clears session on disconnect/wallet change.
 * Uses full reload after reset so no route is left mid-guard without a Router navigate.
 */
export default function WalletReduxSync() {
  const dispatch = useAppDispatch()
  const { authenticated, ready: privyReady } = usePrivy()
  const { isConnected, address, wallet, ready: walletsReady } = useActiveWallet()

  // Keep chainId mirror updated from the active wallet provider.
  useEffect(() => {
    // #region agent log
    agentDebugLog({
      runId: 'post-proxy',
      hypothesisId: 'H1',
      location: 'src/components/session/WalletReduxSync.tsx:chain-effect',
      message: 'WalletReduxSync chainId effect tick',
      data: {
        authenticated,
        privyReady,
        walletsReady,
        isConnected,
        hasWallet: Boolean(wallet),
        addressPresent: Boolean(address),
      },
      timestamp: Date.now(),
    })
    // #endregion agent log
    let cancelled = false
    if (!wallet || !isConnected) {
      dispatch(setWalletFromProvider({ isConnected, address, chainId: undefined }))
      return
    }
    void (async () => {
      try {
        const provider = await wallet.getEthereumProvider()
        const raw = await provider.request({ method: 'eth_chainId' })
        const n =
          typeof raw === 'string' && raw.startsWith('0x') ? Number.parseInt(raw, 16) : Number(raw)
        if (!cancelled) {
          dispatch(setWalletFromProvider({ isConnected, address, chainId: Number.isFinite(n) ? n : undefined }))
        }
      } catch {
        if (!cancelled) {
          dispatch(setWalletFromProvider({ isConnected, address, chainId: undefined }))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dispatch, wallet, isConnected, address, authenticated, privyReady, walletsReady])

  useEffect(() => {
    const { onboarded, accessToken } = store.getState().auth
    if (onboarded && !accessToken?.length) {
      dispatch(patchAuth({ accessToken: 'migrated_session' }))
    }
  }, [dispatch])

  const wasConnected = useRef(false)
  const lastAddress = useRef<string | null>(null)
  useEffect(() => {
    // Privy can briefly report no linked wallets while `ready` is false; treating that as a
    // disconnect resets onboarding and sends users back to choose-role.
    if (!privyReady || !walletsReady) return

    if (wasConnected.current && !isConnected) {
      // #region agent log
      agentDebugLog({
        runId: 'post-fix',
        hypothesisId: 'H2',
        location: 'src/components/session/WalletReduxSync.tsx:disconnect-branch',
        message: 'Redirecting choose-role due to disconnect',
        data: {
          wasConnected: true,
          isConnected,
          prevAddress: lastAddress.current,
          nextAddress: address,
          authenticated,
          privyReady,
          walletsReady,
        },
        timestamp: Date.now(),
      })
      // #endregion agent log
      resetUserSession(dispatch)
      window.location.replace('/onboarding/choose-role')
    }
    // If user swaps wallet/address while “connected”, force re-auth (signature is wallet-bound).
    if (wasConnected.current && isConnected && lastAddress.current && lastAddress.current !== address) {
      // #region agent log
      agentDebugLog({
        runId: 'post-fix',
        hypothesisId: 'H3',
        location: 'src/components/session/WalletReduxSync.tsx:address-change-branch',
        message: 'Redirecting choose-role due to address change',
        data: {
          wasConnected: true,
          isConnected,
          prevAddress: lastAddress.current,
          nextAddress: address,
          authenticated,
          privyReady,
          walletsReady,
        },
        timestamp: Date.now(),
      })
      // #endregion agent log
      resetUserSession(dispatch)
      window.location.replace('/onboarding/choose-role')
    }
    wasConnected.current = isConnected
    lastAddress.current = address
  }, [dispatch, privyReady, walletsReady, isConnected, address, authenticated])

  const wasAuthenticated = useRef(false)
  useEffect(() => {
    if (!privyReady) return
    if (wasAuthenticated.current && !authenticated) {
      // #region agent log
      agentDebugLog({
        runId: 'post-fix',
        hypothesisId: 'H4',
        location: 'src/components/session/WalletReduxSync.tsx:privy-logout-branch',
        message: 'Redirecting choose-role due to privy logout',
        data: {
          prevAuthenticated: true,
          nextAuthenticated: false,
          isConnected,
          address,
          privyReady,
          walletsReady,
        },
        timestamp: Date.now(),
      })
      // #endregion agent log
      resetUserSession(dispatch)
      window.location.replace('/onboarding/choose-role')
    }
    wasAuthenticated.current = authenticated
  }, [dispatch, privyReady, walletsReady, authenticated, isConnected, address])

  return null
}
