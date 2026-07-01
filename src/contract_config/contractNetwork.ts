/** Which on-chain deployment the frontend targets for contract reads/writes. */
export type ContractNetworkMode = 'local' | 'testnet'

const CONTRACT_NETWORK_ENV_KEY = 'VITE_CONTRACT_NETWORK'

function readEnvTrim(key: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[key]?.trim()
  return raw ?? ''
}

/**
 * `local` — Anvil / Hardhat node + `local-deployment-config.json` addresses.
 * `testnet` (default) — Arbitrum Sepolia + `testnet-deployment-config.json`.
 */
export function getContractNetworkMode(): ContractNetworkMode {
  const raw = readEnvTrim(CONTRACT_NETWORK_ENV_KEY).toLowerCase()
  if (raw === 'local') return 'local'
  return 'testnet'
}

export function isLocalContractNetwork(): boolean {
  return getContractNetworkMode() === 'local'
}

export function isTestnetContractNetwork(): boolean {
  return getContractNetworkMode() === 'testnet'
}

/** Human-readable label for UI / logs. */
export function getContractNetworkLabel(): string {
  return isLocalContractNetwork() ? 'Local contracts' : 'Arbitrum Sepolia testnet'
}
