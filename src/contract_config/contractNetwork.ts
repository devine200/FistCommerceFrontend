/** Which on-chain deployment the frontend targets for contract reads/writes. */
export type ContractNetworkMode = 'local' | 'testnet' | 'mainnet'

const CONTRACT_NETWORK_ENV_KEY = 'VITE_CONTRACT_NETWORK'

function readEnvTrim(key: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[key]?.trim()
  return raw ?? ''
}

/**
 * `local` — Anvil / Hardhat node + `local-deployment-config.json` addresses.
 * `testnet` (default) — Arbitrum Sepolia + `testnet-deployment-config.json`.
 * `mainnet` — Arbitrum One + `mainnet-deployment-config.json`.
 */
export function getContractNetworkMode(): ContractNetworkMode {
  const raw = readEnvTrim(CONTRACT_NETWORK_ENV_KEY).toLowerCase()
  if (raw === 'local') return 'local'
  if (raw === 'mainnet') return 'mainnet'
  return 'testnet'
}

export function isLocalContractNetwork(): boolean {
  return getContractNetworkMode() === 'local'
}

export function isTestnetContractNetwork(): boolean {
  return getContractNetworkMode() === 'testnet'
}

export function isMainnetContractNetwork(): boolean {
  return getContractNetworkMode() === 'mainnet'
}

/** Human-readable label for UI / logs. */
export function getContractNetworkLabel(): string {
  switch (getContractNetworkMode()) {
    case 'local':
      return 'Local contracts'
    case 'mainnet':
      return 'Arbitrum One mainnet'
    default:
      return 'Arbitrum Sepolia testnet'
  }
}

/**
 * Display name for the pool accepted token.
 * Mainnet uses native USDC; local/testnet use the mock ERC-20 faucet token.
 */
export function getAcceptedTokenDisplayName(): string {
  return isMainnetContractNetwork() ? 'USDC' : 'Mock ERC-20'
}

/**
 * Default decimals before / if on-chain `decimals()` has not resolved.
 * USDC on Arbitrum One is 6; mock tokens on local/testnet are typically 18.
 * Prefer the live `decimals()` read from the accepted token whenever available.
 */
export function getAcceptedTokenDefaultDecimals(): number {
  return isMainnetContractNetwork() ? 6 : 18
}

/** Test-token mint / faucet is only available off mainnet. */
export function canMintTestTokens(): boolean {
  return !isMainnetContractNetwork()
}
