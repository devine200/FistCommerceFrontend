import { arbitrumSepolia } from 'viem/chains'
import { defineChain, type Chain } from 'viem'

import localConfig from '@/contract_config/local-deployment-config.json'
import { isLocalContractNetwork } from '@/contract_config/contractNetwork'

type LocalChainConfig = {
  chainId: number
  chainName: string
  rpcUrl: string
  blockExplorerUrl?: string
}

const local = localConfig as LocalChainConfig

function readEnvTrim(key: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[key]?.trim()
  return raw ?? ''
}

function resolveLocalChainId(): number {
  const fromEnv = readEnvTrim('VITE_LOCAL_CHAIN_ID')
  if (fromEnv) {
    const n = Number(fromEnv)
    if (Number.isFinite(n) && n > 0) return Math.trunc(n)
  }
  return local.chainId
}

function resolveLocalRpcUrl(): string {
  return readEnvTrim('VITE_LOCAL_RPC_URL') || local.rpcUrl || 'http://127.0.0.1:8545'
}

function resolveLocalExplorerUrl(): string | undefined {
  const fromEnv = readEnvTrim('VITE_LOCAL_BLOCK_EXPLORER_URL')
  const fromJson = local.blockExplorerUrl?.trim()
  const url = fromEnv || fromJson
  return url || undefined
}

/** Anvil / Hardhat — used when `VITE_CONTRACT_NETWORK=local`. */
export const LOCAL_CHAIN: Chain = defineChain({
  id: resolveLocalChainId(),
  name: local.chainName || 'Anvil Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [resolveLocalRpcUrl()] },
  },
  ...(resolveLocalExplorerUrl()
    ? { blockExplorers: { default: { name: 'Explorer', url: resolveLocalExplorerUrl()! } } }
    : {}),
})

/** Arbitrum Sepolia testnet — used when `VITE_CONTRACT_NETWORK=testnet` (default). */
export const TESTNET_CHAIN = arbitrumSepolia

/**
 * Active EVM chain for Privy, wallet enforcement, EIP-712 login, and contract calls.
 * Controlled by `VITE_CONTRACT_NETWORK` (`local` | `testnet`).
 */
export const APP_CHAIN: Chain = isLocalContractNetwork() ? LOCAL_CHAIN : TESTNET_CHAIN
