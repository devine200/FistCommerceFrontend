import type { ConnectedWallet } from '@privy-io/react-auth'

export const ACTIVE_WALLET_STORAGE_KEY = 'fistcommerce.activeWalletId'

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
}

export function clearStoredActiveWalletId(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_WALLET_STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
}

async function revokeAndDisconnectWallet(wallet: ConnectedWallet | null): Promise<void> {
  try {
    const provider = (await wallet?.getEthereumProvider?.()) as Eip1193Provider | undefined
    if (provider?.request) {
      await provider.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      })
    }
  } catch {
    /* ignore */
  }
  try {
    await Promise.resolve(wallet?.disconnect())
  } catch {
    /* ignore */
  }
}

/** Disconnect the linked wallet without ending the Privy login session. */
export async function disconnectLinkedWalletOnly(wallet: ConnectedWallet | null): Promise<void> {
  await revokeAndDisconnectWallet(wallet)
  clearStoredActiveWalletId()
}

/**
 * Best-effort client disconnect then Privy session end.
 * `wallet.disconnect()` is a no-op for some injected wallets (e.g. MetaMask); `logout()` clears Privy auth.
 */
export async function disconnectPrivySession(
  wallet: ConnectedWallet | null,
  logout: (() => Promise<void>) | undefined,
): Promise<void> {
  await revokeAndDisconnectWallet(wallet)
  clearStoredActiveWalletId()
  if (typeof logout === 'function') {
    await logout()
  }
}
