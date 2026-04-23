import type { ConnectedWallet } from '@privy-io/react-auth'

/**
 * Best-effort client disconnect then Privy session end.
 * `wallet.disconnect()` is a no-op for some injected wallets (e.g. MetaMask); `logout()` clears Privy auth.
 */
export async function disconnectPrivySession(
  wallet: ConnectedWallet | null,
  logout: (() => Promise<void>) | undefined,
): Promise<void> {
  try {
    wallet?.disconnect()
  } catch {
    /* ignore */
  }
  if (typeof logout === 'function') {
    await logout()
  }
}
