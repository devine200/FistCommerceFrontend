import type { Chain } from 'viem'

import { APP_CHAIN, getAppChainById, getSupportedAppChains } from '@/wallet/appChain'

export type AppChainManualAddDetails = {
  chainName: string
  chainIdDecimal: number
  chainIdHex: string
  rpcUrl: string
  explorerUrl: string | null
  currencySymbol: string
}

function detailsForChain(chain: Chain): AppChainManualAddDetails {
  const rpcUrl = chain.rpcUrls.default.http[0] ?? ''
  const explorerUrl = chain.blockExplorers?.default?.url ?? null
  return {
    chainName: chain.name,
    chainIdDecimal: chain.id,
    chainIdHex: `0x${chain.id.toString(16)}`,
    rpcUrl,
    explorerUrl,
    currencySymbol: chain.nativeCurrency.symbol,
  }
}

/** Human-readable network details for wrong-network / manual-add UI. */
export function getAppChainManualAddDetails(chainId?: number | null): AppChainManualAddDetails {
  const chain = getAppChainById(chainId) ?? APP_CHAIN
  return detailsForChain(chain)
}

/** Details for every supported app chain (shown when wallet is on an unsupported network). */
export function getSupportedAppChainManualAddDetails(): AppChainManualAddDetails[] {
  return getSupportedAppChains().map(detailsForChain)
}
