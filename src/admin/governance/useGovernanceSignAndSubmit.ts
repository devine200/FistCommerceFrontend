import { useCallback, useState } from 'react'

import { toUserFacingError } from '@/api/client'
import {
  fetchMultisigProposalDetail,
  fetchMultisigSigningPayload,
  postMultisigProposalSign,
} from '@/api/multisig/proposals'
import { isGovernanceSignerAddress } from '@/admin/governance/governanceSigner'
import type { GovernanceSignSubmitResult } from '@/admin/governance/types'
import { useAppSelector } from '@/store/hooks'
import { ensureWalletChain, getWalletClientFromPrivyWallet } from '@/wallet/viemClients'
import { signUserOpHashRaw } from '@/wallet/signUserOpHash'
import { useActiveWallet } from '@/wallet/useActiveWallet'

export function useGovernanceSignAndSubmit() {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionWallet = useAppSelector((s) => s.auth.wallet)
  const { wallet, address, isConnected } = useActiveWallet()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signAndSubmit = useCallback(
    async (proposalId: string): Promise<GovernanceSignSubmitResult | null> => {
      const id = proposalId.trim()
      if (!id) {
        setError('Missing proposal id.')
        return null
      }
      if (!accessToken?.trim()) {
        setError('Sign in to sign proposals.')
        return null
      }
      if (!isConnected || !wallet || !address) {
        setError('Connect your multisig owner wallet to sign.')
        return null
      }
      if (
        sessionWallet?.trim() &&
        sessionWallet.toLowerCase() !== address.toLowerCase()
      ) {
        setError(
          'Connected wallet must match the wallet used for this admin login session.',
        )
        return null
      }

      setPending(true)
      setError(null)
      try {
        const payload = await fetchMultisigSigningPayload(accessToken, id)
        if (!isGovernanceSignerAddress(address, payload.signers)) {
          throw new Error('Connected wallet is not a multisig signer for this proposal.')
        }
        if (payload.chainId > 0) {
          await ensureWalletChain(wallet, payload.chainId)
        }
        const walletClient = await getWalletClientFromPrivyWallet(wallet)
        const hashToSign = (payload.userOpHashToSign || payload.digestToSign) as `0x${string}`
        const signature = await signUserOpHashRaw(
          walletClient,
          address as `0x${string}`,
          hashToSign,
        )
        await postMultisigProposalSign(accessToken, id, {
          signerAddress: address,
          signature,
        })
        const detail = await fetchMultisigProposalDetail(accessToken, id)
        return {
          proposalId: id,
          signature,
          validSignatureCount: detail.validSignatureCount,
          threshold: detail.threshold,
          readyToExecute: detail.readyToExecute,
          signingNote: payload.signingNote,
        }
      } catch (e) {
        const message = toUserFacingError(e, 'Could not sign proposal.')
        setError(message)
        return null
      } finally {
        setPending(false)
      }
    },
    [accessToken, address, isConnected, sessionWallet, wallet],
  )

  return { signAndSubmit, pending, error, clearError: () => setError(null) }
}
