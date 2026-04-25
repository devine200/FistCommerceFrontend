import type { ConnectedWallet } from '@privy-io/react-auth'

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
}

/**
 * Best-effort client disconnect then Privy session end.
 * `wallet.disconnect()` is a no-op for some injected wallets (e.g. MetaMask); `logout()` clears Privy auth.
 */
export async function disconnectPrivySession(
  wallet: ConnectedWallet | null,
  logout: (() => Promise<void>) | undefined,
): Promise<void> {
  // Best-effort: for injected wallets, try to revoke connected-site permissions when supported.
  try {
    const provider = (await wallet?.getEthereumProvider?.()) as Eip1193Provider | undefined
    if (provider?.request) {
      // MetaMask supports `wallet_revokePermissions`. Many wallets will throw; ignore.
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
  if (typeof logout === 'function') {
    await logout()
  }
}
