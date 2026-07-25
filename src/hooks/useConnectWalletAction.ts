import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import { toAppUserFacingError } from '@/errors/toAppUserFacingError'

/** Opens Privy wallet connection (external wallets + embedded wallet login). */
export function useConnectWalletAction() {
  const { ready: privyReady, connectWallet, login } = usePrivy()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const connect = useCallback(async () => {
    if (!privyReady || pending) return
    setError(null)
    setPending(true)
    try {
      if (typeof connectWallet === 'function') {
        await connectWallet()
      } else {
        await login()
      }
    } catch (e) {
      console.error(e)
      setError(
        toAppUserFacingError(e, {
          fallback: 'Could not connect wallet. Please try again.',
          context: 'onboarding',
        }),
      )
    } finally {
      setPending(false)
    }
  }, [privyReady, pending, connectWallet, login])

  return { connect, pending, privyReady, error, clearError }
}
