import { useCallback, useState } from 'react'
import type { Abi, Address, Hex } from 'viem'

import { toUserFacingError } from '@/api/client'
import {
  fetchMultisigExecutionPayload,
  postMultisigProposalConfirmExecute,
} from '@/api/multisig/proposals'
import type { ExecuteProposalResult } from '@/api/types/multisig'
import { isGovernanceSignerAddress } from '@/admin/governance/governanceSigner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearAdminMultisigActionError,
  refreshMultisigConfig,
  refreshMultisigProposalDetail,
} from '@/store/slices/adminMultisigSlice'
import { DEFAULT_APP_CHAIN, getAppChainById } from '@/wallet/appChain'
import { ensureWalletChain, getPublicClient, getWalletClientFromPrivyWallet } from '@/wallet/viemClients'
import { useActiveWallet } from '@/wallet/useActiveWallet'

const ENTRY_POINT_HANDLE_OPS_ABI = [
  {
    type: 'function',
    name: 'handleOps',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'ops',
        type: 'tuple[]',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'initCode', type: 'bytes' },
          { name: 'callData', type: 'bytes' },
          { name: 'accountGasLimits', type: 'bytes32' },
          { name: 'preVerificationGas', type: 'uint256' },
          { name: 'gasFees', type: 'bytes32' },
          { name: 'paymasterAndData', type: 'bytes' },
          { name: 'signature', type: 'bytes' },
        ],
      },
      { name: 'beneficiary', type: 'address' },
    ],
    outputs: [],
  },
] as const satisfies Abi

export function useGovernanceExecuteProposal() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionWallet = useAppSelector((s) => s.auth.wallet)
  const configSigners = useAppSelector((s) => s.adminMultisig.config?.signers ?? [])
  const { wallet, address, isConnected } = useActiveWallet()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<ExecuteProposalResult | null>(null)

  const execute = useCallback(
    async (proposalId: string): Promise<ExecuteProposalResult | null> => {
      const id = proposalId.trim()
      if (!id) {
        setError('Missing proposal id.')
        return null
      }
      if (!accessToken?.trim()) {
        setError('Sign in to execute proposals.')
        return null
      }
      if (!isConnected || !wallet || !address) {
        setError('Connect an on-chain multisig owner wallet to execute.')
        return null
      }
      if (!isGovernanceSignerAddress(address, configSigners)) {
        setError('Connected wallet is not an on-chain multisig owner.')
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
      setLastResult(null)
      dispatch(clearAdminMultisigActionError())
      try {
        const payload = await fetchMultisigExecutionPayload(accessToken, id)
        if (payload.chainId > 0) {
          await ensureWalletChain(wallet, payload.chainId)
        }
        const walletClient = await getWalletClientFromPrivyWallet(wallet, payload.chainId)
        const chain = getAppChainById(payload.chainId) ?? DEFAULT_APP_CHAIN
        const account = address as Address
        const beneficiary = account
        const hash = await walletClient.writeContract({
          chain,
          address: payload.entryPoint,
          abi: ENTRY_POINT_HANDLE_OPS_ABI,
          functionName: 'handleOps',
          args: [
            [
              {
                sender: payload.userOp.sender,
                nonce: payload.userOp.nonce,
                initCode: payload.userOp.initCode,
                callData: payload.userOp.callData,
                accountGasLimits: payload.userOp.accountGasLimits,
                preVerificationGas: payload.userOp.preVerificationGas,
                gasFees: payload.userOp.gasFees,
                paymasterAndData: payload.userOp.paymasterAndData,
                signature: payload.userOp.signature,
              },
            ],
            beneficiary,
          ],
          account,
          gas: BigInt(payload.handleOpsGas || 3_000_000),
        })
        const publicClient = getPublicClient(payload.chainId)
        const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as Hex })
        if (receipt.status !== 'success') {
          throw new Error('EntryPoint handleOps transaction reverted.')
        }
        const result = await postMultisigProposalConfirmExecute(accessToken, id, hash)
        setLastResult(result)
        await dispatch(refreshMultisigProposalDetail(id)).unwrap()
        await dispatch(refreshMultisigConfig()).unwrap().catch(() => {})
        return result
      } catch (e) {
        const message = toUserFacingError(e, 'Could not execute proposal.')
        setError(message)
        return null
      } finally {
        setPending(false)
      }
    },
    [accessToken, address, configSigners, dispatch, isConnected, sessionWallet, wallet],
  )

  return {
    execute,
    pending,
    error,
    lastResult,
    clearError: () => setError(null),
  }
}
