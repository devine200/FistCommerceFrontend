import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { formatEther, formatUnits, parseUnits, type Hash } from 'viem'
import {
  getDeploymentForChainId,
  getPayoutRouterAddress,
} from '@/contract_config/deployment'
import {
  canMintTestTokens,
  getAcceptedTokenDefaultDecimals,
} from '@/contract_config/contractNetwork'
import { postMerchantRepaymentSubmit } from '@/api/payout'
import { displayDashboardMetricString } from '@/api/metrics'
import { useAppSelector } from '@/store/hooks'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import { DEFAULT_APP_CHAIN, isSupportedAppChainId, resolveActiveAppChain } from '@/wallet/appChain'
import { getBufferedEip1559Fees } from '@/wallet/bufferedEip1559Fees'
import { ensureWalletChain, getPublicClient, getWalletClientFromPrivyWallet } from '@/wallet/viemClients'
import {
  computePoolPositionHuman,
  formatPoolPositionUsdDisplay,
  isPoolPositionLoading,
} from '@/utils/fundingPoolPosition'

/** @deprecated Prefer wallet chain + `resolveActiveAppChain`. Default Privy/fallback chain. */
export const __contractsChain_EXPORT__ = DEFAULT_APP_CHAIN

/** @deprecated Use {@link __contractsChain_EXPORT__}. */
export const TESTNET_CONTRACTS_CHAIN = __contractsChain_EXPORT__

export type BalanceCheckResult = {
  ok: boolean
  message?: string
}

export type MerchantRepayOnChainPhase = 'approving' | 'repaying'

function formatTokenHuman(balance: bigint | undefined, decimals: number | undefined): string {
  if (balance === undefined || decimals === undefined) return '—'
  try {
    const n = Number(formatUnits(balance, decimals))
    if (!Number.isFinite(n)) return '—'
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  } catch {
    return '—'
  }
}

function humanAmountToUnits(humanAmount: number, decimals: number): bigint {
  if (!Number.isFinite(humanAmount) || humanAmount <= 0) return 0n
  const frac = Math.min(18, Math.max(0, decimals))
  const s = humanAmount.toFixed(frac).replace(/\.?0+$/, '')
  if (!s || s === '0') return 0n
  return parseUnits(s, decimals)
}

function normalizeTokenDecimals(raw: unknown, fallback: number): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 && raw <= 36) {
    return Math.trunc(raw)
  }
  if (typeof raw === 'bigint' && raw >= 0n && raw <= 36n) {
    return Number(raw)
  }
  return fallback
}

/** Approximate shares to burn for a token-denominated withdrawal (pool accounting). */
function tokenAmountToWithdrawShares(
  assetAmount: bigint,
  totalShares: bigint,
  totalAssets: bigint,
): bigint | null {
  if (totalAssets <= 0n || totalShares <= 0n) return null
  return (assetAmount * totalShares) / totalAssets
}

function formatNativeGasCostLabel(wei: bigint, nativeSymbol: string): string {
  const eth = formatEther(wei)
  const n = Number(eth)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n === 0) return `0 ${nativeSymbol}`
  const compact =
    n < 1e-6
      ? `${n.toExponential(2)} ${nativeSymbol}`
      : `${n.toLocaleString('en-US', { maximumFractionDigits: 8, minimumFractionDigits: 2 })} ${nativeSymbol}`
  return `~${compact}`
}

export type UseTestnetContractsOptions = {
  /** When set, estimates total native cost for approve (if needed) + deposit. */
  estimateDepositHumanAmount?: number
  /** When set, estimates native cost for createWithdrawalRequest. */
  estimateWithdrawHumanAmount?: number
}

/**
 * Smart-contract helpers for the wallet's active supported chain deployment.
 */
export function useTestnetContracts(opts?: UseTestnetContractsOptions) {
  const { wallet, address, isConnected } = useActiveWallet()
  const chainId = useAppSelector((s) => s.wallet.chainId)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const authChainId = useAppSelector((s) => s.auth.chainId)

  const contractsChain =
    resolveActiveAppChain(chainId) ??
    resolveActiveAppChain(authChainId) ??
    DEFAULT_APP_CHAIN
  const deployment = useMemo(
    () => getDeploymentForChainId(contractsChain.id),
    [contractsChain.id],
  )
  const tokenAddress = deployment.MockERC20.address as `0x${string}`
  const fundingPoolAddress = deployment.FundingPool.address as `0x${string}`
  const payoutRouterAddress = (deployment.PayoutRouter.address ||
    getPayoutRouterAddress(contractsChain.id)) as `0x${string}`
  const mockErc20Abi = deployment.MockERC20.abi
  const fundingPoolAbi = deployment.FundingPool.abi

  const publicClient = useMemo(() => getPublicClient(contractsChain.id), [contractsChain.id])
  const [isWritePending, setIsWritePending] = useState(false)

  const isCorrectNetwork = isSupportedAppChainId(chainId) && chainId === contractsChain.id
  const readsEnabled = Boolean(
    isConnected && address && publicClient && isSupportedAppChainId(contractsChain.id),
  )
  const writesEnabled = Boolean(readsEnabled && isCorrectNetwork)

  const decimalsQuery = useQuery({
    queryKey: ['accepted-token-decimals', contractsChain.id, tokenAddress],
    enabled: Boolean(publicClient && isSupportedAppChainId(contractsChain.id)),
    staleTime: 60_000,
    queryFn: async () =>
      await publicClient.readContract({
        address: tokenAddress,
        abi: mockErc20Abi,
        functionName: 'decimals',
      }),
  })

  const tokenDecimals = normalizeTokenDecimals(
    decimalsQuery.data,
    getAcceptedTokenDefaultDecimals(contractsChain.id),
  )

  const balanceQuery = useQuery({
    queryKey: ['testnet-erc20-balance', contractsChain.id, address],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: tokenAddress,
        abi: mockErc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })
    },
  })

  const allowanceQuery = useQuery({
    queryKey: ['testnet-erc20-allowance', contractsChain.id, address, fundingPoolAddress],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: tokenAddress,
        abi: mockErc20Abi,
        functionName: 'allowance',
        args: [address as `0x${string}`, fundingPoolAddress],
      })
    },
  })

  const payoutRouterAllowanceQuery = useQuery({
    queryKey: ['testnet-erc20-allowance-payout', contractsChain.id, address, payoutRouterAddress],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: tokenAddress,
        abi: mockErc20Abi,
        functionName: 'allowance',
        args: [address as `0x${string}`, payoutRouterAddress],
      })
    },
  })

  const userSharesQuery = useQuery({
    queryKey: ['testnet-pool-shares', contractsChain.id, address],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: fundingPoolAddress,
        abi: fundingPoolAbi,
        functionName: 'shares',
        args: [address as `0x${string}`],
      })
    },
  })

  const totalSharesQuery = useQuery({
    queryKey: ['testnet-pool-totalShares', contractsChain.id],
    enabled: Boolean(publicClient),
    staleTime: 15_000,
    queryFn: async () =>
      await publicClient.readContract({
        address: fundingPoolAddress,
        abi: fundingPoolAbi,
        functionName: 'totalShares',
      }),
  })

  const totalAssetsQuery = useQuery({
    queryKey: ['testnet-pool-totalAssets', contractsChain.id],
    enabled: Boolean(publicClient),
    staleTime: 15_000,
    queryFn: async () =>
      await publicClient.readContract({
        address: fundingPoolAddress,
        abi: fundingPoolAbi,
        functionName: 'totalAssets',
      }),
  })

  const balanceBn = typeof balanceQuery.data === 'bigint' ? balanceQuery.data : undefined
  const allowanceBn = typeof allowanceQuery.data === 'bigint' ? allowanceQuery.data : undefined
  const payoutRouterAllowanceBn =
    typeof payoutRouterAllowanceQuery.data === 'bigint' ? payoutRouterAllowanceQuery.data : undefined
  const userSharesBn = typeof userSharesQuery.data === 'bigint' ? userSharesQuery.data : undefined
  const totalSharesBn = typeof totalSharesQuery.data === 'bigint' ? totalSharesQuery.data : undefined
  const totalAssetsBn = typeof totalAssetsQuery.data === 'bigint' ? totalAssetsQuery.data : undefined

  const mockTokenBalanceFormatted = useMemo(
    () => formatTokenHuman(balanceBn, tokenDecimals),
    [balanceBn, tokenDecimals],
  )

  const poolPositionInputs = useMemo(
    () => ({
      userShares: userSharesBn,
      totalShares: totalSharesBn,
      totalAssets: totalAssetsBn,
      tokenDecimals,
    }),
    [userSharesBn, totalSharesBn, totalAssetsBn, tokenDecimals],
  )

  const poolPositionHuman = useMemo(
    () => computePoolPositionHuman(poolPositionInputs),
    [poolPositionInputs],
  )

  const poolPositionUsdDisplay = useMemo(
    () => formatPoolPositionUsdDisplay(poolPositionInputs),
    [poolPositionInputs],
  )

  const poolPositionLoading = useMemo(
    () => isPoolPositionLoading(poolPositionInputs),
    [poolPositionInputs],
  )

  const nativeSymbol = contractsChain.nativeCurrency.symbol

  const estimateDepositHuman = opts?.estimateDepositHumanAmount
  const depositGasQueryEnabled = Boolean(
    writesEnabled &&
      typeof estimateDepositHuman === 'number' &&
      Number.isFinite(estimateDepositHuman) &&
      estimateDepositHuman > 0 &&
      allowanceBn !== undefined,
  )

  const depositGasQuery = useQuery({
    queryKey: [
      'testnet-deposit-gas',
      contractsChain.id,
      address,
      estimateDepositHuman,
      tokenDecimals,
      allowanceBn?.toString(),
    ],
    enabled: depositGasQueryEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!publicClient || !address) throw new Error('Client required')
      const human = estimateDepositHuman!
      const amountWei = humanAmountToUnits(human, tokenDecimals)
      if (amountWei <= 0n) throw new Error('Invalid amount')

      let gasUnits = await publicClient.estimateContractGas({
        address: fundingPoolAddress,
        abi: fundingPoolAbi,
        functionName: 'deposit',
        args: [amountWei],
        account: address as `0x${string}`,
      })
      if ((allowanceBn ?? 0n) < amountWei) {
        const approveGas = await publicClient.estimateContractGas({
          address: tokenAddress,
          abi: mockErc20Abi,
          functionName: 'approve',
          args: [fundingPoolAddress, amountWei],
          account: address as `0x${string}`,
        })
        gasUnits += approveGas
      }
      const fees = await publicClient.estimateFeesPerGas()
      const unit = fees.maxFeePerGas ?? (await publicClient.getGasPrice())
      return gasUnits * unit
    },
  })

  const estimateWithdrawHuman = opts?.estimateWithdrawHumanAmount
  const withdrawGasQueryEnabled = Boolean(
    writesEnabled &&
      typeof estimateWithdrawHuman === 'number' &&
      Number.isFinite(estimateWithdrawHuman) &&
      estimateWithdrawHuman > 0 &&
      totalSharesBn !== undefined &&
      totalAssetsBn !== undefined &&
      totalSharesBn > 0n &&
      totalAssetsBn > 0n,
  )

  const withdrawGasQuery = useQuery({
    queryKey: [
      'testnet-withdraw-gas',
      contractsChain.id,
      address,
      estimateWithdrawHuman,
      tokenDecimals,
      totalSharesBn?.toString(),
      totalAssetsBn?.toString(),
    ],
    enabled: withdrawGasQueryEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!publicClient || !address) throw new Error('Client required')
      const human = estimateWithdrawHuman!
      const assetWei = humanAmountToUnits(human, tokenDecimals)
      const sharesNeeded = tokenAmountToWithdrawShares(
        assetWei,
        totalSharesBn ?? 0n,
        totalAssetsBn ?? 0n,
      )
      if (sharesNeeded === null || sharesNeeded <= 0n) throw new Error('Invalid shares')

      const gasUnits = await publicClient.estimateContractGas({
        address: fundingPoolAddress,
        abi: fundingPoolAbi,
        functionName: 'createWithdrawalRequest',
        args: [sharesNeeded],
        account: address as `0x${string}`,
      })
      const fees = await publicClient.estimateFeesPerGas()
      const unit = fees.maxFeePerGas ?? (await publicClient.getGasPrice())
      return gasUnits * unit
    },
  })

  const depositGasFeeLabel = useMemo(() => {
    if (!depositGasQueryEnabled) return '—'
    if (depositGasQuery.isPending) return 'Estimating…'
    if (depositGasQuery.error) return 'Unable to estimate'
    if (depositGasQuery.data === undefined) return '—'
    return formatNativeGasCostLabel(depositGasQuery.data, nativeSymbol)
  }, [
    depositGasQuery.data,
    depositGasQuery.error,
    depositGasQuery.isPending,
    depositGasQueryEnabled,
    nativeSymbol,
  ])

  const withdrawGasFeeLabel = useMemo(() => {
    if (!withdrawGasQueryEnabled) return '—'
    if (withdrawGasQuery.isPending) return 'Estimating…'
    if (withdrawGasQuery.error) return 'Unable to estimate'
    if (withdrawGasQuery.data === undefined) return '—'
    return formatNativeGasCostLabel(withdrawGasQuery.data, nativeSymbol)
  }, [
    nativeSymbol,
    withdrawGasQuery.data,
    withdrawGasQuery.error,
    withdrawGasQuery.isPending,
    withdrawGasQueryEnabled,
  ])

  const refetchBalances = useCallback(async () => {
    await Promise.all([
      decimalsQuery.refetch(),
      balanceQuery.refetch(),
      allowanceQuery.refetch(),
      payoutRouterAllowanceQuery.refetch(),
      userSharesQuery.refetch(),
      totalSharesQuery.refetch(),
      totalAssetsQuery.refetch(),
    ])
  }, [
    allowanceQuery,
    balanceQuery,
    decimalsQuery,
    payoutRouterAllowanceQuery,
    totalAssetsQuery,
    totalSharesQuery,
    userSharesQuery,
  ])

  const canPayTokenHuman = useCallback(
    (humanAmount: number, actionLabel = 'continue'): BalanceCheckResult => {
      if (!isConnected || !address) return { ok: false, message: 'Connect your wallet to continue.' }
      if (!isCorrectNetwork)
        return {
          ok: false,
          message: `Switch your wallet to ${contractsChain.name} to ${actionLabel}.`,
        }
      if (!Number.isFinite(humanAmount) || humanAmount <= 0)
        return { ok: false, message: 'Enter an amount greater than zero.' }
      const need = humanAmountToUnits(humanAmount, tokenDecimals)
      if (balanceBn === undefined) return { ok: false, message: 'Could not read your token balance.' }
      if (balanceBn < need)
        return {
          ok: false,
          message: `Insufficient token balance. You have ${mockTokenBalanceFormatted} but need at least ${humanAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })}.`,
        }
      return { ok: true }
    },
    [address, balanceBn, isConnected, isCorrectNetwork, mockTokenBalanceFormatted, tokenDecimals],
  )

  const canDepositHuman = useCallback(
    (humanAmount: number): BalanceCheckResult => canPayTokenHuman(humanAmount, 'use the testnet pool'),
    [canPayTokenHuman],
  )

  const canRepayReceivable = useCallback(
    (
      humanAmount: number,
      receivableIdBytes32: `0x${string}` | null,
      maxOwedHuman?: number | null,
    ): BalanceCheckResult => {
      const gate = canPayTokenHuman(humanAmount, 'repay')
      if (!gate.ok) return gate
      if (!receivableIdBytes32) {
        return {
          ok: false,
          message: 'This loan is not linked to an on-chain receivable yet.',
        }
      }
      if (maxOwedHuman != null && Number.isFinite(maxOwedHuman) && humanAmount > maxOwedHuman) {
        return {
          ok: false,
          message: `Amount cannot exceed ${maxOwedHuman.toLocaleString('en-US', { maximumFractionDigits: 2 })} owed.`,
        }
      }
      return { ok: true }
    },
    [canPayTokenHuman],
  )

  const canWithdrawHuman = useCallback(
    (humanAmount: number): BalanceCheckResult => {
      if (!isConnected || !address) return { ok: false, message: 'Connect your wallet to withdraw.' }
      if (!isCorrectNetwork)
        return {
          ok: false,
          message: `Switch your wallet to ${contractsChain.name} for withdrawals.`,
        }
      if (!Number.isFinite(humanAmount) || humanAmount <= 0)
        return { ok: false, message: 'Enter an amount greater than zero.' }
      if (userSharesBn === undefined) return { ok: false, message: 'Could not read your pool shares.' }
      if (poolPositionHuman != null && poolPositionHuman > 0 && humanAmount > poolPositionHuman + 1e-9) {
        return {
          ok: false,
          message: `Amount cannot exceed your investment balance of ${displayDashboardMetricString(poolPositionHuman)}.`,
        }
      }
      const assetWei = humanAmountToUnits(humanAmount, tokenDecimals)
      const sharesNeeded = tokenAmountToWithdrawShares(assetWei, totalSharesBn ?? 0n, totalAssetsBn ?? 0n)
      if (sharesNeeded === null || sharesNeeded <= 0n)
        return { ok: false, message: 'Pool has no assets yet; withdrawals are unavailable.' }
      if (userSharesBn < sharesNeeded) {
        const maxLabel =
          poolPositionHuman != null && poolPositionHuman > 0
            ? displayDashboardMetricString(poolPositionHuman)
            : null
        return {
          ok: false,
          message: maxLabel
            ? `Amount cannot exceed your investment balance of ${maxLabel}.`
            : 'Insufficient pool shares for this withdrawal amount. Try a smaller amount.',
        }
      }
      return { ok: true }
    },
    [address, isConnected, isCorrectNetwork, poolPositionHuman, tokenDecimals, totalAssetsBn, totalSharesBn, userSharesBn],
  )

  const depositFundingPool = useCallback(
    async (humanAmount: number): Promise<Hash> => {
      const gate = canDepositHuman(humanAmount)
      if (!gate.ok) throw new Error(gate.message ?? 'Cannot deposit')
      if (!address) throw new Error('Wallet required')
      if (!wallet) throw new Error('Wallet required')

      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Invalid amount')

      setIsWritePending(true)
      const currentAllowance = allowanceBn ?? 0n
      try {
        await ensureWalletChain(wallet, contractsChain.id)
        const walletClient = await getWalletClientFromPrivyWallet(wallet, contractsChain.id)

        if (currentAllowance < amount) {
          const approveGasFees = await getBufferedEip1559Fees(publicClient)
          const approveHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: mockErc20Abi,
            functionName: 'approve',
            args: [fundingPoolAddress, amount],
            chain: contractsChain,
            account: address as `0x${string}`,
            ...approveGasFees,
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
          await allowanceQuery.refetch()
        }

        const depositGasFees = await getBufferedEip1559Fees(publicClient)
        const depositHash = await walletClient.writeContract({
          address: fundingPoolAddress,
          abi: fundingPoolAbi,
          functionName: 'deposit',
          args: [amount],
          chain: contractsChain,
          account: address as `0x${string}`,
          ...depositGasFees,
        })
        await publicClient.waitForTransactionReceipt({ hash: depositHash })
        await refetchBalances()
        return depositHash
      } finally {
        setIsWritePending(false)
      }
    },
    [
      address,
      allowanceBn,
      allowanceQuery,
      canDepositHuman,
      publicClient,
      refetchBalances,
      tokenDecimals,
      wallet,
    ],
  )

  const mintMockTokens = useCallback(
    async (humanAmount: number): Promise<Hash> => {
      if (!canMintTestTokens(contractsChain.id)) {
        throw new Error('Test token minting is not available on mainnet.')
      }
      if (!isConnected || !address) throw new Error('Connect your wallet to mint test tokens.')
      if (!wallet) throw new Error('Wallet required')
      if (!isCorrectNetwork) {
        throw new Error(`Switch your wallet to ${contractsChain.name} to mint test tokens.`)
      }

      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Enter an amount greater than zero.')

      setIsWritePending(true)
      try {
        await ensureWalletChain(wallet, contractsChain.id)
        const walletClient = await getWalletClientFromPrivyWallet(wallet, contractsChain.id)
        const gasFees = await getBufferedEip1559Fees(publicClient)
        const mintHash = await walletClient.writeContract({
          address: tokenAddress,
          abi: mockErc20Abi,
          functionName: 'mint',
          args: [address as `0x${string}`, amount],
          chain: contractsChain,
          account: address as `0x${string}`,
          ...gasFees,
        })
        await publicClient.waitForTransactionReceipt({ hash: mintHash })
        await refetchBalances()
        return mintHash
      } finally {
        setIsWritePending(false)
      }
    },
    [address, isConnected, isCorrectNetwork, publicClient, refetchBalances, tokenDecimals, wallet],
  )

  const readPayoutRouterAllowance = useCallback(async (): Promise<bigint> => {
    if (!address || !publicClient) return 0n
    const result = await publicClient.readContract({
      address: tokenAddress,
      abi: mockErc20Abi,
      functionName: 'allowance',
      args: [address as `0x${string}`, payoutRouterAddress],
    })
    return typeof result === 'bigint' ? result : 0n
  }, [address, publicClient])

  const needsRepaymentApproval = useCallback(
    (humanAmount: number): boolean => {
      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) return false
      const cached = payoutRouterAllowanceBn ?? 0n
      return cached < amount
    },
    [payoutRouterAllowanceBn, tokenDecimals],
  )

  const approveTokenForRepayment = useCallback(
    async (humanAmount: number): Promise<Hash> => {
      if (!isConnected || !address) throw new Error('Connect your wallet to continue.')
      if (!wallet) throw new Error('Wallet required')
      if (!isCorrectNetwork)
        throw new Error(`Switch your wallet to ${contractsChain.name} to approve tokens.`)

      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Invalid amount')

      const allowanceBefore = await readPayoutRouterAllowance()
      if (allowanceBefore >= amount) {
        throw new Error('Token approval is already sufficient for this amount.')
      }

      setIsWritePending(true)
      try {
        await ensureWalletChain(wallet, contractsChain.id)
        const walletClient = await getWalletClientFromPrivyWallet(wallet, contractsChain.id)
        const gasFees = await getBufferedEip1559Fees(publicClient)

        const approveHash = await walletClient.writeContract({
          address: tokenAddress,
          abi: mockErc20Abi,
          functionName: 'approve',
          args: [payoutRouterAddress, amount],
          chain: contractsChain,
          account: address as `0x${string}`,
          ...gasFees,
        })

        const receipt = await publicClient.waitForTransactionReceipt({ hash: approveHash })
        if (receipt.status !== 'success') {
          throw new Error('Token approval was not confirmed. Please try again.')
        }

        const allowanceAfter = await readPayoutRouterAllowance()
        if (allowanceAfter < amount) {
          throw new Error('Token approval did not complete. Please try again.')
        }

        await payoutRouterAllowanceQuery.refetch()
        return approveHash
      } finally {
        setIsWritePending(false)
      }
    },
    [
      address,
      isConnected,
      isCorrectNetwork,
      payoutRouterAllowanceQuery,
      publicClient,
      readPayoutRouterAllowance,
      tokenDecimals,
      wallet,
    ],
  )

  const submitRepayReceivable = useCallback(
    async (humanAmount: number, receivableIdBytes32: `0x${string}`): Promise<Hash> => {
      const gate = canRepayReceivable(humanAmount, receivableIdBytes32)
      if (!gate.ok) throw new Error(gate.message ?? 'Cannot repay')
      if (!accessToken?.trim()) throw new Error('Sign in to submit repayment.')

      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Invalid amount')

      const allowance = await readPayoutRouterAllowance()
      if (allowance < amount) {
        throw new Error('Approve tokens for this repayment amount before submitting repayment.')
      }

      setIsWritePending(true)
      try {
        const outcome = await postMerchantRepaymentSubmit(
          accessToken,
          receivableIdBytes32,
          amount,
        )
        if (outcome.kind !== 'completed' || !outcome.txHash) {
          throw new Error(outcome.message ?? 'Repayment submission failed.')
        }
        await refetchBalances()
        return outcome.txHash as Hash
      } finally {
        setIsWritePending(false)
      }
    },
    [
      accessToken,
      canRepayReceivable,
      readPayoutRouterAllowance,
      refetchBalances,
      tokenDecimals,
    ],
  )

  const executeMerchantRepayment = useCallback(
    async (
      humanAmount: number,
      receivableIdBytes32: `0x${string}`,
      onPhase?: (phase: MerchantRepayOnChainPhase) => void,
    ): Promise<Hash> => {
      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Invalid amount')

      const allowance = await readPayoutRouterAllowance()
      if (allowance < amount) {
        onPhase?.('approving')
        await approveTokenForRepayment(humanAmount)
      }

      onPhase?.('repaying')
      return await submitRepayReceivable(humanAmount, receivableIdBytes32)
    },
    [approveTokenForRepayment, readPayoutRouterAllowance, submitRepayReceivable, tokenDecimals],
  )

  /** Approve token spending (if needed), then submit repayment via backend servicer. */
  const repayReceivable = useCallback(
    async (humanAmount: number, receivableIdBytes32: `0x${string}`): Promise<Hash> =>
      executeMerchantRepayment(humanAmount, receivableIdBytes32),
    [executeMerchantRepayment],
  )

  const requestFundingPoolWithdraw = useCallback(
    async (humanAmount: number): Promise<Hash> => {
      const gate = canWithdrawHuman(humanAmount)
      if (!gate.ok) throw new Error(gate.message ?? 'Cannot request withdrawal')
      if (!wallet) throw new Error('Wallet required')

      const assetWei = humanAmountToUnits(humanAmount, tokenDecimals)
      const sharesNeeded = tokenAmountToWithdrawShares(
        assetWei,
        totalSharesBn ?? 0n,
        totalAssetsBn ?? 0n,
      )
      if (sharesNeeded === null || sharesNeeded <= 0n) throw new Error('Could not compute shares for withdrawal')

      setIsWritePending(true)
      try {
        await ensureWalletChain(wallet, contractsChain.id)
        const walletClient = await getWalletClientFromPrivyWallet(wallet, contractsChain.id)
        const gasFees = await getBufferedEip1559Fees(publicClient)
        const hash = await walletClient.writeContract({
          address: fundingPoolAddress,
          abi: fundingPoolAbi,
          functionName: 'createWithdrawalRequest',
          args: [sharesNeeded],
          chain: contractsChain,
          account: (address as `0x${string}`) ?? null,
          ...gasFees,
        })
        await publicClient.waitForTransactionReceipt({ hash })
        await refetchBalances()
        return hash
      } finally {
        setIsWritePending(false)
      }
    },
    [
      address,
      canWithdrawHuman,
      publicClient,
      refetchBalances,
      tokenDecimals,
      totalAssetsBn,
      totalSharesBn,
      wallet,
    ],
  )

  return {
    chainId,
    accountAddress: address,
    isConnected,
    isCorrectNetwork,
    testnetChain: contractsChain,
    mockTokenAddress: tokenAddress,
    fundingPoolAddress: fundingPoolAddress,
    payoutRouterAddress: payoutRouterAddress,
    tokenDecimals,
    mockTokenBalance: balanceBn,
    mockTokenBalanceFormatted,
    allowanceToFundingPool: allowanceBn,
    allowanceToPayoutRouter: payoutRouterAllowanceBn,
    userPoolShares: userSharesBn,
    totalPoolShares: totalSharesBn,
    totalPoolAssets: totalAssetsBn,
    poolPositionHuman,
    poolPositionUsdDisplay,
    poolPositionLoading,
    isContractsLoading: readsEnabled && (balanceQuery.isPending || decimalsQuery.isPending),
    isWritePending,
    refetchBalances,
    canPayTokenHuman,
    canDepositHuman,
    canWithdrawHuman,
    canRepayReceivable,
    needsRepaymentApproval,
    approveTokenForRepayment,
    submitRepayReceivable,
    executeMerchantRepayment,
    depositFundingPool,
    mintMockTokens,
    repayReceivable,
    requestFundingPoolWithdraw,
    depositGasFeeLabel,
    withdrawGasFeeLabel,
    isDepositGasEstimating: depositGasQuery.isPending,
    isWithdrawGasEstimating: withdrawGasQuery.isPending,
  }
}

/** Mock ERC-20 balance only — convenience re-export of {@link useTestnetContracts} fields. */
export function useMockErc20Balance() {
  const {
    mockTokenBalance,
    mockTokenBalanceFormatted,
    isContractsLoading,
    refetchBalances,
    isConnected,
    isCorrectNetwork,
  } = useTestnetContracts()

  return {
    balance: mockTokenBalance,
    formattedBalance: mockTokenBalanceFormatted,
    isLoading: isContractsLoading,
    refetch: refetchBalances,
    isConnected,
    isCorrectNetwork,
  }
}
