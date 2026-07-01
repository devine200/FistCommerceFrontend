import { useCallback, useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import { disconnectPrivySession } from '@/session/disconnectPrivySession'
import { resetUserSession } from '@/session/resetUserSession'
import { ADMIN_LOGIN_PATH, shouldRedirectToAdminLogin } from '@/auth/adminSession'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { store } from '@/store'
import { APP_CHAIN } from '@/wallet/appChain'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import { ensureWalletChain } from '@/wallet/viemClients'

function logEnsureWalletChainFailure(
  context: string,
  err: unknown,
  extra: Record<string, unknown>,
) {
  const e = err as { message?: unknown; code?: unknown; name?: unknown; data?: unknown }
  console.error(`[ArbitrumSepoliaWalletEnforcer] ensureWalletChain failed (${context})`, {
    message: e?.message,
    code: e?.code,
    name: e?.name,
    data: e?.data,
    reduxChainId: store.getState().wallet.chainId,
    ...extra,
    err,
  })
}

/**
 * After any wallet becomes active, prefer Arbitrum Sepolia. If the user leaves the app chain,
 * block the app until they switch back or fully log out (Privy + app session).
 */
export default function ArbitrumSepoliaWalletEnforcer() {
  const dispatch = useAppDispatch()
  const { ready: privyReady, logout } = usePrivy()
  const { wallet, isConnected, address, ready: walletsReady } = useActiveWallet()
  const chainId = useAppSelector((s) => s.wallet.chainId)

  /** Dedupe initial switch per address; cleared on effect cleanup if the debounced run never fired (StrictMode-safe). */
  const initialSwitchStartedForKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!privyReady || !walletsReady || !wallet || !isConnected || !address) {
      initialSwitchStartedForKeyRef.current = null
      return
    }
    const key = address.toLowerCase()
    if (initialSwitchStartedForKeyRef.current === key) return
    initialSwitchStartedForKeyRef.current = key

    let cancelled = false
    let timeoutFired = false
    const t = window.setTimeout(() => {
      if (cancelled) return
      timeoutFired = true
      void (async () => {
        console.log('[ArbitrumSepoliaWalletEnforcer] ensureWalletChain (initial debounced) starting…', {
          walletClientType: wallet.walletClientType,
          reduxChainId: store.getState().wallet.chainId,
          targetChainId: APP_CHAIN.id,
        })
        try {
          await ensureWalletChain(wallet, APP_CHAIN.id)
          console.log('[ArbitrumSepoliaWalletEnforcer] ensureWalletChain (initial debounced) resolved OK', {
            reduxChainIdAfter: store.getState().wallet.chainId,
          })
        } catch (err) {
          logEnsureWalletChainFailure('initialDebouncedSwitch', err, {
            targetChainId: APP_CHAIN.id,
            walletClientType: wallet.walletClientType,
            addressPreview: address ? `${address.slice(0, 8)}…` : null,
          })
        }
      })()
    }, 300)
    return () => {
      cancelled = true
      window.clearTimeout(t)
      if (!timeoutFired) {
        initialSwitchStartedForKeyRef.current = null
      }
    }
  }, [privyReady, walletsReady, wallet, isConnected, address])

  const wrongNetwork =
    privyReady &&
    walletsReady &&
    isConnected &&
    Boolean(address) &&
    chainId != null &&
    chainId !== APP_CHAIN.id

  const handleLogoutWrongNetwork = useCallback(async () => {
    await disconnectPrivySession(wallet, logout)
    const { accessToken, sessionKind } = store.getState().auth
    const pathname = typeof window !== 'undefined' ? window.location.pathname : undefined
    const toAdminLogin = shouldRedirectToAdminLogin({ accessToken, sessionKind, pathname })
    resetUserSession(dispatch)
    window.location.replace(toAdminLogin ? ADMIN_LOGIN_PATH : '/onboarding/choose-role')
  }, [wallet, logout, dispatch])

  const handleSwitchToAppChain = useCallback(() => {
    const reduxBefore = store.getState().wallet.chainId
    console.log('[ArbitrumSepoliaWalletEnforcer] "Switch network" clicked', {
      hasWallet: Boolean(wallet),
      walletClientType: wallet?.walletClientType,
      reduxChainIdBefore: reduxBefore,
      targetChainId: APP_CHAIN.id,
    })
    if (!wallet) {
      console.warn('[ArbitrumSepoliaWalletEnforcer] switch ignored — no active wallet object')
      return
    }
    void (async () => {
      console.log('[ArbitrumSepoliaWalletEnforcer] ensureWalletChain (modal) starting…')
      try {
        await ensureWalletChain(wallet, APP_CHAIN.id)
        console.log('[ArbitrumSepoliaWalletEnforcer] ensureWalletChain (modal) resolved OK', {
          reduxChainIdAfter: store.getState().wallet.chainId,
        })
      } catch (err) {
        logEnsureWalletChainFailure('modalRetrySwitchToAppChain', err, {
          targetChainId: APP_CHAIN.id,
          walletClientType: wallet.walletClientType,
          addressPreview: wallet.address ? `${wallet.address.slice(0, 8)}…` : null,
        })
      }
    })()
  }, [wallet])

  return (
    <DashboardErrorModal
      blocking
      open={wrongNetwork}
      title="Wrong network"
      message={`This app runs on ${APP_CHAIN.name} only. Switch your wallet back to ${APP_CHAIN.name}, or log out.`}
      retryLabel={`Switch to ${APP_CHAIN.name}`}
      onRetry={handleSwitchToAppChain}
      secondaryLabel="Log out"
      onSecondary={() => void handleLogoutWrongNetwork()}
      onClose={() => {}}
    />
  )
}
