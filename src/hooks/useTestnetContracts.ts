import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { formatEther, formatUnits, parseUnits, type Hash } from 'viem'
import { useAccount, useChainId, usePublicClient, useReadContract, useWriteContract } from 'wagmi'
import { sepolia } from 'wagmi/chains'

import {
  TESTNET_FUNDING_POOL_ABI,
  TESTNET_FUNDING_POOL_ADDRESS,
  TESTNET_MOCK_ERC20_ABI,
  TESTNET_MOCK_ERC20_ADDRESS,
} from '@/contract_config/testnetDeployment'

/** Chain where `testnet-deployment-config.json` contracts are deployed. */
export const TESTNET_CONTRACTS_CHAIN = sepolia

export type BalanceCheckResult = {
  ok: boolean
  message?: string
}

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
 * Smart-contract helpers for the Sepolia testnet deployment (`testnet-deployment-config.json`).
 * Use {@link TESTNET_CONTRACTS_CHAIN} — switch the wallet to Sepolia for reads/writes.
 */
export function useTestnetContracts(opts?: UseTestnetContractsOptions) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId: TESTNET_CONTRACTS_CHAIN.id })
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  const isCorrectNetwork = chainId === TESTNET_CONTRACTS_CHAIN.id
  const enabled = Boolean(isConnected && address && isCorrectNetwork)

  const { data: decimals, refetch: refetchDecimals } = useReadContract({
    chainId: TESTNET_CONTRACTS_CHAIN.id,
    address: TESTNET_MOCK_ERC20_ADDRESS,
    abi: TESTNET_MOCK_ERC20_ABI,
    functionName: 'decimals',
    query: { enabled },
  })

  const tokenDecimals = typeof decimals === 'number' ? decimals : 18

  const { data: balance, refetch: refetchBalance } = useReadContract({
    chainId: TESTNET_CONTRACTS_CHAIN.id,
    address: TESTNET_MOCK_ERC20_ADDRESS,
    abi: TESTNET_MOCK_ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    chainId: TESTNET_CONTRACTS_CHAIN.id,
    address: TESTNET_MOCK_ERC20_ADDRESS,
    abi: TESTNET_MOCK_ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, TESTNET_FUNDING_POOL_ADDRESS] : undefined,
    query: { enabled },
  })

  const { data: userShares, refetch: refetchShares } = useReadContract({
    chainId: TESTNET_CONTRACTS_CHAIN.id,
    address: TESTNET_FUNDING_POOL_ADDRESS,
    abi: TESTNET_FUNDING_POOL_ABI,
    functionName: 'shares',
    args: address ? [address] : undefined,
    query: { enabled },
  })

  const { data: totalShares, refetch: refetchTotalShares } = useReadContract({
    chainId: TESTNET_CONTRACTS_CHAIN.id,
    address: TESTNET_FUNDING_POOL_ADDRESS,
    abi: TESTNET_FUNDING_POOL_ABI,
    functionName: 'totalShares',
    query: { enabled },
  })

  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    chainId: TESTNET_CONTRACTS_CHAIN.id,
    address: TESTNET_FUNDING_POOL_ADDRESS,
    abi: TESTNET_FUNDING_POOL_ABI,
    functionName: 'totalAssets',
    query: { enabled },
  })

  const balanceBn = typeof balance === 'bigint' ? balance : undefined
  const allowanceBn = typeof allowance === 'bigint' ? allowance : undefined
  const userSharesBn = typeof userShares === 'bigint' ? userShares : undefined
  const totalSharesBn = typeof totalShares === 'bigint' ? totalShares : undefined
  const totalAssetsBn = typeof totalAssets === 'bigint' ? totalAssets : undefined

  const mockTokenBalanceFormatted = useMemo(
    () => formatTokenHuman(balanceBn, tokenDecimals),
    [balanceBn, tokenDecimals],
  )

  const nativeSymbol = TESTNET_CONTRACTS_CHAIN.nativeCurrency.symbol

  const estimateDepositHuman = opts?.estimateDepositHumanAmount
  const depositGasQueryEnabled = Boolean(
    publicClient &&
      address &&
      isCorrectNetwork &&
      typeof estimateDepositHuman === 'number' &&
      Number.isFinite(estimateDepositHuman) &&
      estimateDepositHuman > 0 &&
      allowanceBn !== undefined,
  )

  const depositGasQuery = useQuery({
    queryKey: [
      'testnet-deposit-gas',
      TESTNET_CONTRACTS_CHAIN.id,
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
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'deposit',
        args: [amountWei],
        account: address,
      })
      if ((allowanceBn ?? 0n) < amountWei) {
        const approveGas = await publicClient.estimateContractGas({
          address: TESTNET_MOCK_ERC20_ADDRESS,
          abi: TESTNET_MOCK_ERC20_ABI,
          functionName: 'approve',
          args: [TESTNET_FUNDING_POOL_ADDRESS, amountWei],
          account: address,
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
    publicClient &&
      address &&
      isCorrectNetwork &&
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
      TESTNET_CONTRACTS_CHAIN.id,
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
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'createWithdrawalRequest',
        args: [sharesNeeded],
        account: address,
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
      refetchDecimals(),
      refetchBalance(),
      refetchAllowance(),
      refetchShares(),
      refetchTotalShares(),
      refetchTotalAssets(),
    ])
  }, [
    refetchAllowance,
    refetchBalance,
    refetchDecimals,
    refetchShares,
    refetchTotalAssets,
    refetchTotalShares,
  ])

  const canDepositHuman = useCallback(
    (humanAmount: number): BalanceCheckResult => {
      if (!isConnected || !address) return { ok: false, message: 'Connect your wallet to invest.' }
      if (!isCorrectNetwork)
        return {
          ok: false,
          message: `Switch your wallet to ${TESTNET_CONTRACTS_CHAIN.name} to use the testnet pool.`,
        }
      if (!Number.isFinite(humanAmount) || humanAmount <= 0)
        return { ok: false, message: 'Enter an amount greater than zero.' }
      const need = humanAmountToUnits(humanAmount, tokenDecimals)
      if (balanceBn === undefined) return { ok: false, message: 'Could not read your token balance.' }
      if (balanceBn < need)
        return {
          ok: false,
          message: `Insufficient mock ERC-20 balance. You have ${mockTokenBalanceFormatted} tokens but need at least ${humanAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })}.`,
        }
      return { ok: true }
    },
    [address, balanceBn, isConnected, isCorrectNetwork, mockTokenBalanceFormatted, tokenDecimals],
  )

  const canWithdrawHuman = useCallback(
    (humanAmount: number): BalanceCheckResult => {
      if (!isConnected || !address) return { ok: false, message: 'Connect your wallet to withdraw.' }
      if (!isCorrectNetwork)
        return {
          ok: false,
          message: `Switch your wallet to ${TESTNET_CONTRACTS_CHAIN.name} for withdrawals.`,
        }
      if (!Number.isFinite(humanAmount) || humanAmount <= 0)
        return { ok: false, message: 'Enter an amount greater than zero.' }
      if (userSharesBn === undefined) return { ok: false, message: 'Could not read your pool shares.' }
      const assetWei = humanAmountToUnits(humanAmount, tokenDecimals)
      const sharesNeeded = tokenAmountToWithdrawShares(assetWei, totalSharesBn ?? 0n, totalAssetsBn ?? 0n)
      if (sharesNeeded === null || sharesNeeded <= 0n)
        return { ok: false, message: 'Pool has no assets yet; withdrawals are unavailable.' }
      if (userSharesBn < sharesNeeded)
        return {
          ok: false,
          message: 'Insufficient pool shares for this withdrawal amount. Try a smaller amount.',
        }
      return { ok: true }
    },
    [address, isConnected, isCorrectNetwork, tokenDecimals, totalAssetsBn, totalSharesBn, userSharesBn],
  )

  const depositFundingPool = useCallback(
    async (humanAmount: number): Promise<Hash> => {
      const gate = canDepositHuman(humanAmount)
      if (!gate.ok) throw new Error(gate.message ?? 'Cannot deposit')
      if (!address) throw new Error('Wallet required')
      if (!publicClient) throw new Error('Network client unavailable')

      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Invalid amount')

      const currentAllowance = allowanceBn ?? 0n
      if (currentAllowance < amount) {
        const approveHash = await writeContractAsync({
          chainId: TESTNET_CONTRACTS_CHAIN.id,
          address: TESTNET_MOCK_ERC20_ADDRESS,
          abi: TESTNET_MOCK_ERC20_ABI,
          functionName: 'approve',
          args: [TESTNET_FUNDING_POOL_ADDRESS, amount],
        })
        await publicClient.waitForTransactionReceipt({ hash: approveHash })
        await refetchAllowance()
      }

      const depositHash = await writeContractAsync({
        chainId: TESTNET_CONTRACTS_CHAIN.id,
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'deposit',
        args: [amount],
      })
      await publicClient.waitForTransactionReceipt({ hash: depositHash })
      await refetchBalances()
      return depositHash
    },
    [
      address,
      allowanceBn,
      canDepositHuman,
      publicClient,
      refetchAllowance,
      refetchBalances,
      tokenDecimals,
      writeContractAsync,
    ],
  )

  const requestFundingPoolWithdraw = useCallback(
    async (humanAmount: number): Promise<Hash> => {
      const gate = canWithdrawHuman(humanAmount)
      if (!gate.ok) throw new Error(gate.message ?? 'Cannot request withdrawal')
      if (!publicClient) throw new Error('Network client unavailable')

      const assetWei = humanAmountToUnits(humanAmount, tokenDecimals)
      const sharesNeeded = tokenAmountToWithdrawShares(
        assetWei,
        totalSharesBn ?? 0n,
        totalAssetsBn ?? 0n,
      )
      if (sharesNeeded === null || sharesNeeded <= 0n) throw new Error('Could not compute shares for withdrawal')

      const hash = await writeContractAsync({
        chainId: TESTNET_CONTRACTS_CHAIN.id,
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'createWithdrawalRequest',
        args: [sharesNeeded],
      })
      await publicClient.waitForTransactionReceipt({ hash })
      await refetchBalances()
      return hash
    },
    [
      canWithdrawHuman,
      publicClient,
      refetchBalances,
      tokenDecimals,
      totalAssetsBn,
      totalSharesBn,
      writeContractAsync,
    ],
  )

  return {
    chainId,
    accountAddress: address,
    isConnected,
    isCorrectNetwork,
    testnetChain: TESTNET_CONTRACTS_CHAIN,
    mockTokenAddress: TESTNET_MOCK_ERC20_ADDRESS,
    fundingPoolAddress: TESTNET_FUNDING_POOL_ADDRESS,
    tokenDecimals,
    mockTokenBalance: balanceBn,
    mockTokenBalanceFormatted,
    allowanceToFundingPool: allowanceBn,
    userPoolShares: userSharesBn,
    totalPoolShares: totalSharesBn,
    totalPoolAssets: totalAssetsBn,
    isContractsLoading: enabled && (balance === undefined || decimals === undefined),
    isWritePending,
    refetchBalances,
    canDepositHuman,
    canWithdrawHuman,
    depositFundingPool,
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
