import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import { resetUserSession } from '@/session/resetUserSession'
import { logoutAdminSession } from '@/session/logoutAdminSession'
import {
  ADMIN_LOGIN_PATH,
  isAdminDashboardPath,
  isAdminLoginPath,
  isAdminSession,
  shouldRedirectToAdminLogin,
} from '@/auth/adminSession'
import { store } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import type { AppDispatch } from '@/store'
import { patchAuth } from '@/store/slices/authSlice'
import { setWalletFromProvider } from '@/store/slices/walletSlice'
import { syncWalletChainIdFromProviderToRedux } from '@/wallet/syncWalletChainToRedux'
import { useActiveWallet } from '@/wallet/useActiveWallet'

/**
 * After idle, Privy/the wallet provider can briefly report an empty wallet list while `ready` is
 * true. Resetting immediately clears Redux and forces choose-role; wait before treating disconnect
 * as real when the user is still Privy-authenticated.
 */
const DISCONNECT_SESSION_RESET_MS = 2500

// Opt-in only: avoids noisy console/network errors in dev when no ingest proxy is configured.
const AGENT_DEBUG_INGEST =
  import.meta.env.DEV && String(import.meta.env.VITE_AGENT_DEBUG_INGEST_ENABLED).toLowerCase() === 'true'
    ? '/ingest/fb9c849e-37ad-4a71-b70c-257ccd07e08d'
    : ''

function agentDebugLog(payload: Record<string, unknown>) {
  if (!AGENT_DEBUG_INGEST) return
  void fetch(AGENT_DEBUG_INGEST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'eda03a',
    },
    body: JSON.stringify({ sessionId: 'eda03a', ...payload }),
  }).then((res) => {
    // `fetch` doesn't reject on 4xx/5xx; swallow to keep console clean.
    if (!res.ok) return
  }).catch(() => {})
}

type Eip1193Emitter = {
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

/** Wallet disconnect / Privy logout routing for admin vs investor/merchant flows. */
function resetWalletAppSessionAndRedirect(dispatch: AppDispatch) {
  const { sessionKind, accessToken } = store.getState().auth
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  // Admin sign-in screen: disconnect/reconnect is expected; stay on `/admin/login`.
  if (isAdminLoginPath(pathname)) return

  const onAdminDashboard = Boolean(pathname && isAdminDashboardPath(pathname))
  if (sessionKind === 'admin' || (onAdminDashboard && isAdminSession(accessToken, sessionKind))) {
    void logoutAdminSession(dispatch).catch(() => {
      window.location.assign(ADMIN_LOGIN_PATH)
    })
    return
  }

  if (shouldRedirectToAdminLogin({ accessToken, sessionKind, pathname })) {
    resetUserSession(dispatch)
    window.location.replace(ADMIN_LOGIN_PATH)
    return
  }

  resetUserSession(dispatch)
  window.location.replace('/onboarding/choose-role')
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
    let detachProviderListeners: (() => void) | undefined
    let clearPollInterval: (() => void) | undefined

    if (!wallet || !isConnected) {
      dispatch(setWalletFromProvider({ isConnected, address, chainId: undefined }))
      return () => {
        cancelled = true
      }
    }

    const pushChainIdFromProvider = async () => {
      await syncWalletChainIdFromProviderToRedux(wallet, isConnected, address, {
        isCancelled: () => cancelled,
      })
    }

    void (async () => {
      await pushChainIdFromProvider()
      if (cancelled) return
      let listenersAttached = false
      try {
        const provider = await wallet.getEthereumProvider()
        if (cancelled) return
        const emitter = provider as unknown as Eip1193Emitter
        const onChainChanged = () => {
          void pushChainIdFromProvider()
        }
        const onAccountsChanged = () => {
          void pushChainIdFromProvider()
        }
        if (typeof emitter.on === 'function') {
          emitter.on('chainChanged', onChainChanged)
          emitter.on('accountsChanged', onAccountsChanged)
          detachProviderListeners = () => {
            emitter.removeListener?.('chainChanged', onChainChanged)
            emitter.removeListener?.('accountsChanged', onAccountsChanged)
          }
          listenersAttached = true
        }
      } catch {
        /* ignore */
      }
      if (!listenersAttached && !cancelled) {
        const pollId = window.setInterval(() => {
          void pushChainIdFromProvider()
        }, 2000)
        clearPollInterval = () => window.clearInterval(pollId)
      }
    })()

    return () => {
      cancelled = true
      detachProviderListeners?.()
      clearPollInterval?.()
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
  /** Timer id (`number` in DOM; Node typings may use `Timeout`). */
  const disconnectResetTimerRef = useRef<number | null>(null)
  const isConnectedRef = useRef(isConnected)
  const authenticatedRef = useRef(authenticated)
  isConnectedRef.current = isConnected
  authenticatedRef.current = authenticated

  useEffect(() => {
    return () => {
      if (disconnectResetTimerRef.current) {
        clearTimeout(disconnectResetTimerRef.current)
        disconnectResetTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Privy can briefly report no linked wallets while `ready` is false; treating that as a
    // disconnect resets onboarding and sends users back to choose-role.
    if (!privyReady || !walletsReady) return

    const clearPendingDisconnectReset = () => {
      if (disconnectResetTimerRef.current) {
        clearTimeout(disconnectResetTimerRef.current)
        disconnectResetTimerRef.current = null
      }
    }

    if (isConnected) {
      clearPendingDisconnectReset()
    }

    if (wasConnected.current && !isConnected) {
      const runDisconnectReset = () => {
        clearPendingDisconnectReset()
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
        resetWalletAppSessionAndRedirect(dispatch)
      }

      // Still Privy-authenticated: only reset after a sustained disconnect (avoids idle flicker).
      if (authenticated) {
        clearPendingDisconnectReset()
        disconnectResetTimerRef.current = window.setTimeout(() => {
          disconnectResetTimerRef.current = null
          if (isConnectedRef.current) return
          if (!authenticatedRef.current) return
          runDisconnectReset()
        }, DISCONNECT_SESSION_RESET_MS)
      } else {
        runDisconnectReset()
      }
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
      resetWalletAppSessionAndRedirect(dispatch)
    }
    wasConnected.current = isConnected
    lastAddress.current = address
  }, [dispatch, privyReady, walletsReady, isConnected, address, authenticated])

  const wasAuthenticated = useRef(false)
  useEffect(() => {
    if (!privyReady) return
    if (wasAuthenticated.current && !authenticated) {
      if (disconnectResetTimerRef.current) {
        clearTimeout(disconnectResetTimerRef.current)
        disconnectResetTimerRef.current = null
      }
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
      resetWalletAppSessionAndRedirect(dispatch)
    }
    wasAuthenticated.current = authenticated
  }, [dispatch, privyReady, walletsReady, authenticated, isConnected, address])

  return null
}
