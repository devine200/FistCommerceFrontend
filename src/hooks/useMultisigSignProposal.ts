import { useCallback, useState } from 'react'

import { fetchMultisigSigningPayload } from '@/api/multisig/proposals'
import { isGovernanceSignerAddress } from '@/admin/governance/governanceSigner'
import { useAppSelector } from '@/store/hooks'
import { ensureWalletChain, getWalletClientFromPrivyWallet } from '@/wallet/viemClients'
import { signUserOpHashRaw } from '@/wallet/signUserOpHash'
import { useActiveWallet } from '@/wallet/useActiveWallet'

/** Fetches signing payload and returns a raw ECDSA signature over userOpHash (no POST). */
export function useMultisigSignProposal() {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const { wallet, address, isConnected } = useActiveWallet()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSigningNote, setLastSigningNote] = useState<string | null>(null)

  const signProposal = useCallback(
    async (proposalId: string, chainId?: number): Promise<string | null> => {
      if (!accessToken?.trim()) {
        setError('Sign in to sign proposals.')
        return null
      }
      if (!isConnected || !wallet || !address) {
        setError('Connect your multisig owner wallet to sign.')
        return null
      }

      setPending(true)
      setError(null)
      try {
        const payload = await fetchMultisigSigningPayload(accessToken, proposalId)
        setLastSigningNote(payload.signingNote || null)
        if (!isGovernanceSignerAddress(address, payload.signers)) {
          throw new Error('Connected wallet is not a multisig signer for this proposal.')
        }
        const effectiveChainId = chainId && chainId > 0 ? chainId : payload.chainId
        if (effectiveChainId > 0) {
          await ensureWalletChain(wallet, effectiveChainId)
        }
        const walletClient = await getWalletClientFromPrivyWallet(wallet)
        const hashToSign = (payload.userOpHashToSign || payload.digestToSign) as `0x${string}`
        return await signUserOpHashRaw(walletClient, address as `0x${string}`, hashToSign)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not sign proposal.'
        setError(message)
        return null
      } finally {
        setPending(false)
      }
    },
    [accessToken, address, isConnected, wallet],
  )

  return { signProposal, pending, error, lastSigningNote, clearError: () => setError(null) }
}
