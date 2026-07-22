import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import { logoutAdminSession } from '@/session/logoutAdminSession'
import { endAppSessionAndRedirect } from '@/session/sessionEnd'
import {
  ADMIN_LOGIN_PATH,
  isAdminDashboardPath,
  isAdminLoginPath,
  isAdminSession,
  shouldRedirectToAdminLogin,
} from '@/auth/adminSession'
import { store } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { AppDispatch } from '@/store'
import { patchAuth } from '@/store/slices/authSlice'
import { setWalletFromProvider } from '@/store/slices/walletSlice'
import { syncWalletChainIdFromProviderToRedux } from '@/wallet/syncWalletChainToRedux'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import type { SessionEndReason } from '@/session/sessionEnd'
import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'

/**
 * After idle, Privy/the wallet provider can briefly report an empty wallet list while `ready` is
 * true. Resetting immediately clears Redux and forces choose-role; wait before treating disconnect
 * as real when the user is still Privy-authenticated.
 */
const DISCONNECT_SESSION_RESET_MS = 2500

type Eip1193Emitter = {
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

function isOnboardingPath(pathname: string): boolean {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/')
}

/** Wallet disconnect / Privy logout routing for admin vs investor/merchant flows. */
function resetWalletAppSessionAndRedirect(dispatch: AppDispatch, reason: SessionEndReason) {
  const { sessionKind, accessToken, role } = store.getState().auth
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  // Admin sign-in screen: disconnect/reconnect is expected; stay on `/admin/login`.
  if (isAdminLoginPath(pathname)) return

  // Mid-onboarding: wallet flicker / swap / chain change must not wipe progress or bounce to choose-role.
  // Tokens are wallet+chain-bound — clear them so Continue re-signs; keep role + step progress.
  if (
    pathname &&
    isOnboardingPath(pathname) &&
    (reason === 'wallet_disconnected' || reason === 'wallet_changed' || reason === 'chain_mismatch')
  ) {
    if (reason === 'wallet_disconnected') {
      dispatch(setWalletFromProvider({ isConnected: false, address: null, chainId: undefined }))
    }
    dispatch(patchAuth({ accessToken: null, refreshToken: null }))
    return
  }

  const onAdminDashboard = Boolean(pathname && isAdminDashboardPath(pathname))
  if (
    sessionKind === 'admin' ||
    (onAdminDashboard && isAdminSession(accessToken, sessionKind)) ||
    shouldRedirectToAdminLogin({ accessToken, sessionKind, pathname })
  ) {
    void logoutAdminSession(dispatch).catch(() => {
      window.location.assign(ADMIN_LOGIN_PATH)
    })
    return
  }

  void endAppSessionAndRedirect(dispatch, {
    reason,
    accessToken,
    sessionKind,
    role,
    keepRole: true,
  })
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
  }, [dispatch, wallet, isConnected, address])

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
        resetWalletAppSessionAndRedirect(dispatch, 'wallet_disconnected')
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
      resetWalletAppSessionAndRedirect(dispatch, 'wallet_changed')
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
      resetWalletAppSessionAndRedirect(dispatch, 'privy_logout')
    }
    wasAuthenticated.current = authenticated
  }, [dispatch, privyReady, walletsReady, authenticated, isConnected, address])

  // Chain change while logged in → automatic logout (app + admin).
  const authChainId = useAppSelector((s) => s.auth.chainId)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const refreshToken = useAppSelector((s) => s.auth.refreshToken)
  const walletChainId = useAppSelector((s) => s.wallet.chainId)
  const lastBoundChainRef = useRef<number | null>(null)
  const chainLogoutTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (chainLogoutTimerRef.current) {
        clearTimeout(chainLogoutTimerRef.current)
        chainLogoutTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const hasTokens =
      Boolean(refreshToken?.trim()) || isUsableApiAccessToken(accessToken)
    if (!hasTokens || authChainId == null) {
      lastBoundChainRef.current = authChainId
      return
    }
    if (walletChainId == null) return

    // Establish baseline after login without treating first sync as a change.
    if (lastBoundChainRef.current == null) {
      lastBoundChainRef.current = authChainId
    }

    if (walletChainId === authChainId) {
      lastBoundChainRef.current = authChainId
      if (chainLogoutTimerRef.current) {
        clearTimeout(chainLogoutTimerRef.current)
        chainLogoutTimerRef.current = null
      }
      return
    }

    // Debounce brief provider flicker before logging out.
    if (chainLogoutTimerRef.current) clearTimeout(chainLogoutTimerRef.current)
    chainLogoutTimerRef.current = window.setTimeout(() => {
      chainLogoutTimerRef.current = null
      const state = store.getState()
      const stillHasTokens =
        Boolean(state.auth.refreshToken?.trim()) ||
        isUsableApiAccessToken(state.auth.accessToken)
      if (!stillHasTokens) return
      if (state.auth.chainId == null) return
      if (state.wallet.chainId == null) return
      if (state.wallet.chainId === state.auth.chainId) return
      lastBoundChainRef.current = null
      resetWalletAppSessionAndRedirect(dispatch, 'chain_mismatch')
    }, 250)
  }, [dispatch, authChainId, accessToken, refreshToken, walletChainId])

  return null
}
