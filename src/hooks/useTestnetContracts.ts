import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { formatEther, formatUnits, parseUnits, type Hash } from 'viem'
import { sepolia } from 'viem/chains'

import {
  TESTNET_FUNDING_POOL_ABI,
  TESTNET_FUNDING_POOL_ADDRESS,
  TESTNET_MOCK_ERC20_ABI,
  TESTNET_MOCK_ERC20_ADDRESS,
} from '@/contract_config/testnetDeployment'
import { useAppSelector } from '@/store/hooks'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import { ensureWalletChain, getPublicClient, getWalletClientFromPrivyWallet } from '@/wallet/viemClients'

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
  const { wallet, address, isConnected } = useActiveWallet()
  const chainId = useAppSelector((s) => s.wallet.chainId)
  const publicClient = useMemo(() => getPublicClient(), [])
  const [isWritePending, setIsWritePending] = useState(false)

  const isCorrectNetwork = chainId === TESTNET_CONTRACTS_CHAIN.id
  /** Reads use {@link getPublicClient} on Sepolia; they do not require the injected wallet’s chain. */
  const readsEnabled = Boolean(isConnected && address && publicClient)
  /** Writes / gas estimates still require the wallet to be on the deployment chain. */
  const writesEnabled = Boolean(readsEnabled && isCorrectNetwork)

  const decimalsQuery = useQuery({
    queryKey: ['testnet-erc20-decimals', TESTNET_CONTRACTS_CHAIN.id],
    enabled: Boolean(publicClient),
    staleTime: 60_000,
    queryFn: async () =>
      await publicClient.readContract({
        address: TESTNET_MOCK_ERC20_ADDRESS,
        abi: TESTNET_MOCK_ERC20_ABI,
        functionName: 'decimals',
      }),
  })

  const tokenDecimals = typeof decimalsQuery.data === 'number' ? decimalsQuery.data : 18

  const balanceQuery = useQuery({
    queryKey: ['testnet-erc20-balance', TESTNET_CONTRACTS_CHAIN.id, address],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: TESTNET_MOCK_ERC20_ADDRESS,
        abi: TESTNET_MOCK_ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })
    },
  })

  const allowanceQuery = useQuery({
    queryKey: ['testnet-erc20-allowance', TESTNET_CONTRACTS_CHAIN.id, address, TESTNET_FUNDING_POOL_ADDRESS],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: TESTNET_MOCK_ERC20_ADDRESS,
        abi: TESTNET_MOCK_ERC20_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, TESTNET_FUNDING_POOL_ADDRESS],
      })
    },
  })

  const userSharesQuery = useQuery({
    queryKey: ['testnet-pool-shares', TESTNET_CONTRACTS_CHAIN.id, address],
    enabled: readsEnabled,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) throw new Error('Wallet required')
      return await publicClient.readContract({
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'shares',
        args: [address as `0x${string}`],
      })
    },
  })

  const totalSharesQuery = useQuery({
    queryKey: ['testnet-pool-totalShares', TESTNET_CONTRACTS_CHAIN.id],
    enabled: Boolean(publicClient),
    staleTime: 15_000,
    queryFn: async () =>
      await publicClient.readContract({
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'totalShares',
      }),
  })

  const totalAssetsQuery = useQuery({
    queryKey: ['testnet-pool-totalAssets', TESTNET_CONTRACTS_CHAIN.id],
    enabled: Boolean(publicClient),
    staleTime: 15_000,
    queryFn: async () =>
      await publicClient.readContract({
        address: TESTNET_FUNDING_POOL_ADDRESS,
        abi: TESTNET_FUNDING_POOL_ABI,
        functionName: 'totalAssets',
      }),
  })

  const balanceBn = typeof balanceQuery.data === 'bigint' ? balanceQuery.data : undefined
  const allowanceBn = typeof allowanceQuery.data === 'bigint' ? allowanceQuery.data : undefined
  const userSharesBn = typeof userSharesQuery.data === 'bigint' ? userSharesQuery.data : undefined
  const totalSharesBn = typeof totalSharesQuery.data === 'bigint' ? totalSharesQuery.data : undefined
  const totalAssetsBn = typeof totalAssetsQuery.data === 'bigint' ? totalAssetsQuery.data : undefined

  const mockTokenBalanceFormatted = useMemo(
    () => formatTokenHuman(balanceBn, tokenDecimals),
    [balanceBn, tokenDecimals],
  )

  const nativeSymbol = TESTNET_CONTRACTS_CHAIN.nativeCurrency.symbol

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
        account: address as `0x${string}`,
      })
      if ((allowanceBn ?? 0n) < amountWei) {
        const approveGas = await publicClient.estimateContractGas({
          address: TESTNET_MOCK_ERC20_ADDRESS,
          abi: TESTNET_MOCK_ERC20_ABI,
          functionName: 'approve',
          args: [TESTNET_FUNDING_POOL_ADDRESS, amountWei],
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
      userSharesQuery.refetch(),
      totalSharesQuery.refetch(),
      totalAssetsQuery.refetch(),
    ])
  }, [
    allowanceQuery,
    balanceQuery,
    decimalsQuery,
    totalAssetsQuery,
    totalSharesQuery,
    userSharesQuery,
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
      if (!wallet) throw new Error('Wallet required')

      const amount = humanAmountToUnits(humanAmount, tokenDecimals)
      if (amount <= 0n) throw new Error('Invalid amount')

      setIsWritePending(true)
      const currentAllowance = allowanceBn ?? 0n
      try {
        await ensureWalletChain(wallet, TESTNET_CONTRACTS_CHAIN.id)
        const walletClient = await getWalletClientFromPrivyWallet(wallet)

        if (currentAllowance < amount) {
          const approveHash = await walletClient.writeContract({
            address: TESTNET_MOCK_ERC20_ADDRESS,
            abi: TESTNET_MOCK_ERC20_ABI,
            functionName: 'approve',
            args: [TESTNET_FUNDING_POOL_ADDRESS, amount],
            chain: TESTNET_CONTRACTS_CHAIN,
            account: address as `0x${string}`,
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
          await allowanceQuery.refetch()
        }

        const depositHash = await walletClient.writeContract({
          address: TESTNET_FUNDING_POOL_ADDRESS,
          abi: TESTNET_FUNDING_POOL_ABI,
          functionName: 'deposit',
          args: [amount],
          chain: TESTNET_CONTRACTS_CHAIN,
          account: address as `0x${string}`,
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
        await ensureWalletChain(wallet, TESTNET_CONTRACTS_CHAIN.id)
        const walletClient = await getWalletClientFromPrivyWallet(wallet)
        const hash = await walletClient.writeContract({
          address: TESTNET_FUNDING_POOL_ADDRESS,
          abi: TESTNET_FUNDING_POOL_ABI,
          functionName: 'createWithdrawalRequest',
          args: [sharesNeeded],
          chain: TESTNET_CONTRACTS_CHAIN,
          account: (address as `0x${string}`) ?? null,
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
    isContractsLoading: readsEnabled && (balanceQuery.isPending || decimalsQuery.isPending),
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
