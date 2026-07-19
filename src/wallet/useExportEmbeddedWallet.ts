import { useCallback, useState } from 'react'
import { useExportWallet } from '@privy-io/react-auth'

import { toUserFacingError } from '@/api/client'
import { useActiveWallet } from '@/wallet/useActiveWallet'

export type UseExportEmbeddedWalletResult = {
  /**
   * Opens Privy's secure export modal for the active embedded wallet. The private key is rendered
   * inside a cross-origin iframe — this app never receives it — so the returned promise resolves
   * with no value once the user dismisses the modal.
   */
  exportKey: () => Promise<void>
  /** True only for Privy embedded wallets; external wallets manage their own keys. */
  isEmbedded: boolean
  ready: boolean
  pending: boolean
  error: string | null
  clearError: () => void
}

/**
 * Thin, guarded wrapper around Privy's {@link useExportWallet}. Restricts export to the embedded
 * wallet and surfaces a user-facing error instead of throwing. Never exposes key material.
 */
export function useExportEmbeddedWallet(): UseExportEmbeddedWalletResult {
  const { exportWallet } = useExportWallet()
  const { wallet, address, walletClientType, ready } = useActiveWallet()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEmbedded = walletClientType === 'privy'

  const exportKey = useCallback(async () => {
    setError(null)
    if (!ready) {
      setError('Wallet is still loading. Please try again in a moment.')
      return
    }
    if (!isEmbedded || !wallet || !address) {
      setError('Private key export is only available for embedded wallets.')
      return
    }
    setPending(true)
    try {
      await exportWallet({ address })
    } catch (e) {
      setError(toUserFacingError(e, 'Could not open the private key export.'))
    } finally {
      setPending(false)
    }
  }, [exportWallet, ready, isEmbedded, wallet, address])

  return {
    exportKey,
    isEmbedded,
    ready,
    pending,
    error,
    clearError: () => setError(null),
  }
}
