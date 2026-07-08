import { APP_CHAIN } from '@/wallet/appChain'

export type AppChainManualAddDetails = {
  chainName: string
  chainIdDecimal: number
  chainIdHex: string
  rpcUrl: string
  explorerUrl: string | null
  currencySymbol: string
}

/** Human-readable network details for wrong-network / manual-add UI. */
export function getAppChainManualAddDetails(): AppChainManualAddDetails {
  const rpcUrl = APP_CHAIN.rpcUrls.default.http[0] ?? ''
  const explorerUrl = APP_CHAIN.blockExplorers?.default?.url ?? null
  return {
    chainName: APP_CHAIN.name,
    chainIdDecimal: APP_CHAIN.id,
    chainIdHex: `0x${APP_CHAIN.id.toString(16)}`,
    rpcUrl,
    explorerUrl,
    currencySymbol: APP_CHAIN.nativeCurrency.symbol,
  }
}
