import { useMemo } from 'react'

import { useTestnetContracts } from '@/hooks/useTestnetContracts'

/** Human-readable token balance line for financial flows (invest, repay, etc.). */
export function useTokenBalanceLabel(actionWhenOffChain: string) {
  const contracts = useTestnetContracts()

  return useMemo(() => {
    if (!contracts.isConnected) return 'Connect your wallet to view your token balance.'
    if (contracts.isContractsLoading) return 'Loading balance…'
    const formatted = contracts.mockTokenBalanceFormatted
    const amountLine = formatted === '—' ? 'Wallet balance: —' : `Wallet balance: ${formatted}`
    if (!contracts.isCorrectNetwork) {
      return `${amountLine} (switch to ${contracts.testnetChain.name} to ${actionWhenOffChain}.)`
    }
    return amountLine
  }, [
    actionWhenOffChain,
    contracts.isConnected,
    contracts.isContractsLoading,
    contracts.isCorrectNetwork,
    contracts.mockTokenBalanceFormatted,
    contracts.testnetChain.name,
  ])
}
