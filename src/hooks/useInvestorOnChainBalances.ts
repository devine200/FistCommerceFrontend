import { useMemo } from 'react'

import { displayDashboardMetricString } from '@/api/metrics'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'

/** On-chain pool position + wallet token balance for investor financial flows. */
export function useInvestorOnChainBalances() {
  const contracts = useTestnetContracts()

  const investmentBalanceDisplay = useMemo(() => {
    if (!contracts.isConnected) return '—'
    if (contracts.poolPositionLoading) return '—'
    return contracts.poolPositionUsdDisplay
  }, [contracts.isConnected, contracts.poolPositionLoading, contracts.poolPositionUsdDisplay])

  const walletBalanceDisplay = useMemo(() => {
    if (!contracts.isConnected) return '—'
    if (contracts.isContractsLoading) return '—'
    const formatted = contracts.mockTokenBalanceFormatted
    if (formatted === '—') return '—'
    return displayDashboardMetricString(formatted)
  }, [contracts.isConnected, contracts.isContractsLoading, contracts.mockTokenBalanceFormatted])

  const investmentBalanceHuman = contracts.poolPositionHuman

  const walletBalanceHuman = useMemo(() => {
    const formatted = contracts.mockTokenBalanceFormatted
    if (formatted === '—') return null
    const n = Number(formatted.replace(/,/g, ''))
    return Number.isFinite(n) ? n : null
  }, [contracts.mockTokenBalanceFormatted])

  return {
    contracts,
    investmentBalanceDisplay,
    walletBalanceDisplay,
    investmentBalanceHuman,
    walletBalanceHuman,
    walletTokenBalanceFormatted: contracts.mockTokenBalanceFormatted,
    poolPositionLoading: contracts.poolPositionLoading,
  }
}
