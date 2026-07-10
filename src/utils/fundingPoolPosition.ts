import { formatUnits } from 'viem'

import { displayDashboardMetricString } from '@/api/metrics'

export type PoolPositionInputs = {
  userShares: bigint | undefined
  totalShares: bigint | undefined
  totalAssets: bigint | undefined
  tokenDecimals: number
}

export function computePoolPositionAssetWei({
  userShares,
  totalShares,
  totalAssets,
}: PoolPositionInputs): bigint | null {
  if (userShares === undefined || totalShares === undefined || totalAssets === undefined) {
    return null
  }
  if (totalShares <= 0n) return 0n
  return (userShares * totalAssets) / totalShares
}

export function computePoolPositionHuman(inputs: PoolPositionInputs): number | null {
  const assetWei = computePoolPositionAssetWei(inputs)
  if (assetWei === null) return null
  try {
    const n = Number(formatUnits(assetWei, inputs.tokenDecimals))
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

/** USD-style display for pool position (token units treated as dollars in testnet UI). */
export function formatPoolPositionUsdDisplay(inputs: PoolPositionInputs): string {
  const human = computePoolPositionHuman(inputs)
  if (human === null) return '—'
  return displayDashboardMetricString(human)
}

export function isPoolPositionLoading(inputs: PoolPositionInputs): boolean {
  return (
    inputs.userShares === undefined ||
    inputs.totalShares === undefined ||
    inputs.totalAssets === undefined
  )
}
