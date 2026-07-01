import type { Abi, Address } from 'viem'

import { isLocalContractNetwork } from '@/contract_config/contractNetwork'
import localConfig from '@/contract_config/local-deployment-config.json'
import testnetDeployment from '@/contract_config/testnet-deployment-config.json'

type ContractEntry = { address: string; abi: Abi }

type FullDeploymentJson = {
  deploymentBlock?: number
  MockERC20?: ContractEntry
  ProtocolController: ContractEntry
  investorVerificationNFT: ContractEntry
  loanVerificationNFT: ContractEntry
  merchantVerificationNFT: ContractEntry
  ComplianceRegistry: ContractEntry
  AllocationController: ContractEntry
  PayoutRouter: ContractEntry
  FundingPool: ContractEntry
  FistMultisigAccount?: ContractEntry
  fistMultisigAccount?: ContractEntry
}

type LocalDeploymentJson = {
  deploymentBlock?: number
  MockERC20: { address: string }
  ProtocolController: { address: string }
  investorVerificationNFT: { address: string }
  loanVerificationNFT: { address: string }
  merchantVerificationNFT: { address: string }
  ComplianceRegistry: { address: string }
  AllocationController: { address: string }
  PayoutRouter: { address: string }
  FundingPool: { address: string }
}

/** Minimal ERC20 ABI when MockERC20 is omitted from deployment JSON. */
const MINIMAL_ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const satisfies Abi

function readEnvAddress(key: string): string | undefined {
  const raw = (import.meta.env as Record<string, string | undefined>)[key]?.trim()
  return raw || undefined
}

function resolveMockErc20Entry(
  raw: Partial<FullDeploymentJson>,
  localAddresses?: LocalDeploymentJson,
): ContractEntry {
  if (raw.MockERC20?.address) {
    return {
      address: raw.MockERC20.address,
      abi: raw.MockERC20.abi ?? MINIMAL_ERC20_ABI,
    }
  }
  if (localAddresses?.MockERC20?.address) {
    return {
      address: localAddresses.MockERC20.address,
      abi: MINIMAL_ERC20_ABI,
    }
  }
  const envAddr = readEnvAddress('VITE_MOCK_ERC20_ADDRESS')
  if (envAddr) {
    return { address: envAddr, abi: MINIMAL_ERC20_ABI }
  }
  console.warn(
    '[deployment] MockERC20 missing from config; set VITE_MOCK_ERC20_ADDRESS for token reads.',
  )
  return {
    address: '0x0000000000000000000000000000000000000000',
    abi: MINIMAL_ERC20_ABI,
  }
}

function normalizeDeployment(
  raw: Partial<FullDeploymentJson>,
  localAddresses?: LocalDeploymentJson,
): FullDeploymentJson & { MockERC20: ContractEntry } {
  return {
    ...(raw as FullDeploymentJson),
    MockERC20: resolveMockErc20Entry(raw, localAddresses),
  }
}

const testnetRaw = testnetDeployment as Partial<FullDeploymentJson>
const local = localConfig as LocalDeploymentJson

function withLocalAddresses(
  base: FullDeploymentJson & { MockERC20: ContractEntry },
  addresses: LocalDeploymentJson,
): FullDeploymentJson & { MockERC20: ContractEntry } {
  return {
    deploymentBlock: addresses.deploymentBlock ?? base.deploymentBlock,
    MockERC20: {
      address: addresses.MockERC20.address,
      abi: base.MockERC20.abi,
    },
    ProtocolController: {
      address: addresses.ProtocolController.address,
      abi: base.ProtocolController.abi,
    },
    investorVerificationNFT: {
      address: addresses.investorVerificationNFT.address,
      abi: base.investorVerificationNFT.abi,
    },
    loanVerificationNFT: {
      address: addresses.loanVerificationNFT.address,
      abi: base.loanVerificationNFT.abi,
    },
    merchantVerificationNFT: {
      address: addresses.merchantVerificationNFT.address,
      abi: base.merchantVerificationNFT.abi,
    },
    ComplianceRegistry: {
      address: addresses.ComplianceRegistry.address,
      abi: base.ComplianceRegistry.abi,
    },
    AllocationController: {
      address: addresses.AllocationController.address,
      abi: base.AllocationController.abi,
    },
    PayoutRouter: { address: addresses.PayoutRouter.address, abi: base.PayoutRouter.abi },
    FundingPool: { address: addresses.FundingPool.address, abi: base.FundingPool.abi },
    FistMultisigAccount: base.FistMultisigAccount,
    fistMultisigAccount: base.fistMultisigAccount,
  }
}

const testnetBase = normalizeDeployment(testnetRaw)

/** Active deployment (local addresses + shared ABIs, or full testnet JSON). */
export const ACTIVE_DEPLOYMENT: FullDeploymentJson & { MockERC20: ContractEntry } =
  isLocalContractNetwork() ? withLocalAddresses(testnetBase, local) : testnetBase

export const MOCK_ERC20_ADDRESS = ACTIVE_DEPLOYMENT.MockERC20.address as Address
export const FUNDING_POOL_ADDRESS = ACTIVE_DEPLOYMENT.FundingPool.address as Address
export const PAYOUT_ROUTER_ADDRESS = ACTIVE_DEPLOYMENT.PayoutRouter.address as Address
export const MOCK_ERC20_ABI = ACTIVE_DEPLOYMENT.MockERC20.abi
export const FUNDING_POOL_ABI = ACTIVE_DEPLOYMENT.FundingPool.abi
export const PAYOUT_ROUTER_ABI = ACTIVE_DEPLOYMENT.PayoutRouter.abi

/** Full deployment record for admin protocol settings panels. */
export function getActiveDeploymentAddresses(): LocalDeploymentJson {
  const d = ACTIVE_DEPLOYMENT
  return {
    deploymentBlock: d.deploymentBlock,
    MockERC20: { address: d.MockERC20.address },
    ProtocolController: { address: d.ProtocolController.address },
    investorVerificationNFT: { address: d.investorVerificationNFT.address },
    loanVerificationNFT: { address: d.loanVerificationNFT.address },
    merchantVerificationNFT: { address: d.merchantVerificationNFT.address },
    ComplianceRegistry: { address: d.ComplianceRegistry.address },
    AllocationController: { address: d.AllocationController.address },
    PayoutRouter: { address: d.PayoutRouter.address },
    FundingPool: { address: d.FundingPool.address },
  }
}
