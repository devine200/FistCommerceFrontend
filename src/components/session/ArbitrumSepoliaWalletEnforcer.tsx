import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'

import {
  isOnboardingConnectWalletPath,
  onboardingConnectWalletPath,
} from '@/access/onboardingPaths'
import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import WrongNetworkHelp from '@/components/session/WrongNetworkHelp'
import { disconnectLinkedWalletOnly, disconnectPrivySession } from '@/session/disconnectPrivySession'
import { resetUserSession } from '@/session/resetUserSession'
import { ADMIN_LOGIN_PATH, shouldRedirectToAdminLogin } from '@/auth/adminSession'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { store } from '@/store'
import { resetWallet } from '@/store/slices/walletSlice'
import { parseUserRole } from '@/utils/userRole'
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
 * block the app until they switch back, choose another wallet, or fully log out.
 *
 * On the onboarding connect-wallet step, auto-switch and the blocking modal are skipped so the user
 * can pick a wallet and switch only when they press Continue.
 */
export default function ArbitrumSepoliaWalletEnforcer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const role = useAppSelector((s) => s.auth.role)
  const { ready: privyReady, logout } = usePrivy()
  const { wallet, isConnected, address, ready: walletsReady } = useActiveWallet()
  const chainId = useAppSelector((s) => s.wallet.chainId)
  const [switchError, setSwitchError] = useState<string | null>(null)
  const [switching, setSwitching] = useState(false)
  const [choosingWallet, setChoosingWallet] = useState(false)

  const skipEnforcer = isOnboardingConnectWalletPath(pathname)

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
    if (skipEnforcer) {
      initialSwitchStartedForKeyRef.current = null
      return
    }
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
  }, [skipEnforcer, privyReady, walletsReady, wallet, isConnected, address, runEnsureWalletChain])

  const wrongNetwork =
    privyReady &&
    walletsReady &&
    isConnected &&
    Boolean(address) &&
    chainId != null &&
    chainId !== APP_CHAIN.id

  const showBlockingModal = wrongNetwork && !skipEnforcer

  useEffect(() => {
    if (!wrongNetwork || skipEnforcer) {
      setSwitchError(null)
      setSwitching(false)
    }
  }, [wrongNetwork, skipEnforcer])

  const handleLogoutWrongNetwork = useCallback(async () => {
    await disconnectPrivySession(wallet, logout)
    const { accessToken, sessionKind } = store.getState().auth
    const currentPathname = typeof window !== 'undefined' ? window.location.pathname : undefined
    const toAdminLogin = shouldRedirectToAdminLogin({ accessToken, sessionKind, pathname: currentPathname })
    resetUserSession(dispatch)
    window.location.replace(toAdminLogin ? ADMIN_LOGIN_PATH : '/onboarding/choose-role')
  }, [wallet, logout, dispatch])

  const handleChooseDifferentWallet = useCallback(async () => {
    if (choosingWallet) return
    setChoosingWallet(true)
    try {
      await disconnectLinkedWalletOnly(wallet)
      dispatch(resetWallet())
      const parsedRole = parseUserRole(role)
      if (parsedRole) {
        navigate(onboardingConnectWalletPath(parsedRole), { replace: true })
        return
      }
      navigate('/onboarding/choose-role', { replace: true })
    } finally {
      setChoosingWallet(false)
    }
  }, [choosingWallet, wallet, dispatch, role, navigate])

  const handleSwitchToAppChain = useCallback(() => {
    if (!wallet) {
      console.warn('[ArbitrumSepoliaWalletEnforcer] switch ignored — no active wallet object')
      return
    }
    void runEnsureWalletChain('modalRetry')
  }, [wallet, runEnsureWalletChain])

  const modalMessage = switchError
    ? switchError
    : `This app runs on ${APP_CHAIN.name} only. Switch your wallet to ${APP_CHAIN.name}, choose a different wallet, or log out.`

  return (
    <DashboardErrorModal
      blocking
      open={showBlockingModal}
      title="Wrong network"
      message={modalMessage}
      retryLabel={switching ? 'Switching…' : `Switch to ${APP_CHAIN.name}`}
      retryDisabled={switching || choosingWallet}
      onRetry={handleSwitchToAppChain}
      tertiaryLabel={choosingWallet ? 'Opening wallet picker…' : 'Choose a different wallet'}
      onTertiary={() => void handleChooseDifferentWallet()}
      secondaryLabel="Log out"
      onSecondary={() => void handleLogoutWrongNetwork()}
      onClose={() => {}}
    >
      <WrongNetworkHelp />
    </DashboardErrorModal>
  )
}
