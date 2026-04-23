import type { ConnectedWallet } from '@privy-io/react-auth'

export type ActiveWalletSelectionOptions = {
  /** Optional persisted id/address for user-chosen active wallet. */
  preferredWalletId?: string | null
}

/**
 * Deterministically select an active wallet from Privy wallets.
 *
 * Priority:
 * 1) user-preferred (if present)
 * 2) injected (metamask, phantom)
 * 3) wallet_connect
 * 4) privy (embedded)
 * 5) fallback to first
 */
export function selectActiveWallet(
  wallets: readonly ConnectedWallet[] | null | undefined,
  opts?: ActiveWalletSelectionOptions,
): ConnectedWallet | null {
  if (!wallets?.length) return null

  const preferred = (opts?.preferredWalletId ?? '').trim()
  if (preferred) {
    const byAddress = wallets.find((w) => (w.address ?? '').toLowerCase() === preferred.toLowerCase())
    if (byAddress) return byAddress
  }

  const injectedPriority = new Set(['metamask', 'phantom'])
  const injected = wallets.find((w) => injectedPriority.has(w.walletClientType))
  if (injected) return injected

  const wc = wallets.find((w) => w.walletClientType === 'wallet_connect')
  if (wc) return wc

  const embedded = wallets.find((w) => w.walletClientType === 'privy')
  if (embedded) return embedded

  return wallets[0] ?? null
}

