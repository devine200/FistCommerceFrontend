import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import WrongNetworkHelp from '@/components/session/WrongNetworkHelp'
import { disconnectPrivySession } from '@/session/disconnectPrivySession'
import { resetUserSession } from '@/session/resetUserSession'
import { ADMIN_LOGIN_PATH, shouldRedirectToAdminLogin } from '@/auth/adminSession'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { store } from '@/store'
import { APP_CHAIN } from '@/wallet/appChain'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import { formatWalletChainSwitchError } from '@/wallet/walletChainErrors'
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
  const [switchError, setSwitchError] = useState<string | null>(null)
  const [switching, setSwitching] = useState(false)

  /** Dedupe initial switch per address; cleared on effect cleanup if the debounced run never fired (StrictMode-safe). */
  const initialSwitchStartedForKeyRef = useRef<string | null>(null)

  const runEnsureWalletChain = useCallback(
    async (context: string) => {
      if (!wallet) return
      setSwitching(true)
      try {
        await ensureWalletChain(wallet, APP_CHAIN.id)
        setSwitchError(null)
        if (import.meta.env.DEV) {
          console.log(`[ArbitrumSepoliaWalletEnforcer] ensureWalletChain (${context}) resolved OK`, {
            reduxChainIdAfter: store.getState().wallet.chainId,
          })
        }
      } catch (err) {
        logEnsureWalletChainFailure(context, err, {
          targetChainId: APP_CHAIN.id,
          walletClientType: wallet.walletClientType,
          addressPreview: wallet.address ? `${wallet.address.slice(0, 8)}…` : null,
        })
        setSwitchError(formatWalletChainSwitchError(err, APP_CHAIN.name))
      } finally {
        setSwitching(false)
      }
    },
    [wallet],
  )

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
      void runEnsureWalletChain('initialDebounced')
    }, 300)
    return () => {
      cancelled = true
      window.clearTimeout(t)
      if (!timeoutFired) {
        initialSwitchStartedForKeyRef.current = null
      }
    }
  }, [privyReady, walletsReady, wallet, isConnected, address, runEnsureWalletChain])

  const wrongNetwork =
    privyReady &&
    walletsReady &&
    isConnected &&
    Boolean(address) &&
    chainId != null &&
    chainId !== APP_CHAIN.id

  useEffect(() => {
    if (!wrongNetwork) {
      setSwitchError(null)
      setSwitching(false)
    }
  }, [wrongNetwork])

  const handleLogoutWrongNetwork = useCallback(async () => {
    await disconnectPrivySession(wallet, logout)
    const { accessToken, sessionKind } = store.getState().auth
    const pathname = typeof window !== 'undefined' ? window.location.pathname : undefined
    const toAdminLogin = shouldRedirectToAdminLogin({ accessToken, sessionKind, pathname })
    resetUserSession(dispatch)
    window.location.replace(toAdminLogin ? ADMIN_LOGIN_PATH : '/onboarding/choose-role')
  }, [wallet, logout, dispatch])

  const handleSwitchToAppChain = useCallback(() => {
    if (!wallet) {
      console.warn('[ArbitrumSepoliaWalletEnforcer] switch ignored — no active wallet object')
      return
    }
    void runEnsureWalletChain('modalRetry')
  }, [wallet, runEnsureWalletChain])

  const modalMessage = switchError
    ? switchError
    : `This app runs on ${APP_CHAIN.name} only. Switch your wallet back to ${APP_CHAIN.name}, or log out.`

  return (
    <DashboardErrorModal
      blocking
      open={wrongNetwork}
      title="Wrong network"
      message={modalMessage}
      retryLabel={switching ? 'Switching…' : `Switch to ${APP_CHAIN.name}`}
      retryDisabled={switching}
      onRetry={handleSwitchToAppChain}
      secondaryLabel="Log out"
      onSecondary={() => void handleLogoutWrongNetwork()}
      onClose={() => {}}
    >
      <WrongNetworkHelp />
    </DashboardErrorModal>
  )
}
