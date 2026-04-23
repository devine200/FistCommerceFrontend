import { useWallets, type ConnectedWallet } from '@privy-io/react-auth'
import { useCallback, useMemo, useState } from 'react'

import { selectActiveWallet } from './selectActiveWallet'

const ACTIVE_WALLET_STORAGE_KEY = 'fistcommerce.activeWalletId'

function safeGetStorageItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetStorageItem(key: string, value: string | null) {
  try {
    if (!value) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // ignore (storage disabled)
  }
}

export type UseActiveWalletResult = {
  wallets: readonly ConnectedWallet[]
  wallet: ConnectedWallet | null
  address: string | null
  walletClientType: ConnectedWallet['walletClientType'] | null
  isConnected: boolean
  activeWalletId: string | null
  setActiveWalletId: (next: string | null) => void
  /** True once Privy wallets have finished initializing. */
  ready: boolean
}

export function useActiveWallet(): UseActiveWalletResult {
  const { wallets, ready } = useWallets()
  const [activeWalletIdState, setActiveWalletIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return safeGetStorageItem(ACTIVE_WALLET_STORAGE_KEY)
  })

  const setActiveWalletId = useCallback((next: string | null) => {
    const normalized = next?.trim() ? next.trim() : null
    setActiveWalletIdState(normalized)
    if (typeof window !== 'undefined') {
      safeSetStorageItem(ACTIVE_WALLET_STORAGE_KEY, normalized)
    }
  }, [])

  const wallet = useMemo(() => {
    return selectActiveWallet(wallets, { preferredWalletId: activeWalletIdState })
  }, [wallets, activeWalletIdState])

  const address = wallet?.address ?? null
  const walletClientType = wallet?.walletClientType ?? null
  const isConnected = Boolean(wallet && address)

  return {
    wallets,
    wallet,
    address,
    walletClientType,
    isConnected,
    activeWalletId: activeWalletIdState,
    setActiveWalletId,
    ready,
  }
}

