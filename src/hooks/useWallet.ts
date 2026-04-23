import { useAppSelector } from '@/store/hooks'
import { formatWalletAddressForTopBar } from '@/utils/formatWalletAddressForTopBar'
import { useActiveWallet } from '@/wallet/useActiveWallet'

/** Privy as source of truth for live connection; Redux mirror for selectors / disconnect resets */
export function useWallet() {
  const redux = useAppSelector((s) => s.wallet)
  const { isConnected: connected, address: addr } = useActiveWallet()
  const chainId = redux.chainId
  return {
    redux,
    isConnected: connected,
    address: addr,
    chainId,
    /** Short form for top bars when wagmi reports a connected account */
    shortAddress: connected && addr ? formatWalletAddressForTopBar(addr) : null,
  }
}
