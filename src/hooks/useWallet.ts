import { useConnection } from 'wagmi'

import { useAppSelector } from '@/store/hooks'
import { formatWalletAddressForTopBar } from '@/utils/formatWalletAddressForTopBar'

/** Wagmi as source of truth for live connection; Redux mirror for selectors / disconnect resets */
export function useWallet() {
  const redux = useAppSelector((s) => s.wallet)
  const { status, address, chainId } = useConnection()
  const connected = status === 'connected'
  const addr = address ?? null
  return {
    redux,
    isConnected: connected,
    address: addr,
    chainId,
    /** Short form for top bars when wagmi reports a connected account */
    shortAddress: connected && addr ? formatWalletAddressForTopBar(addr) : null,
  }
}
