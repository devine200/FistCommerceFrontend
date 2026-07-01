import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

/** Opens Privy wallet connection (external wallets + embedded wallet login). */
export function useConnectWalletAction() {
  const { ready: privyReady, connectWallet, login } = usePrivy()
  const [pending, setPending] = useState(false)

  const connect = useCallback(async () => {
    if (!privyReady || pending) return
    setPending(true)
    try {
      if (typeof connectWallet === 'function') {
        await connectWallet()
      } else {
        await login()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setPending(false)
    }
  }, [privyReady, pending, connectWallet, login])

  return { connect, pending, privyReady }
}
