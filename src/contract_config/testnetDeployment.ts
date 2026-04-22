import type { Abi, Address } from 'viem'

import deployment from '@/contract_config/testnet-deployment-config.json'

type DeploymentJson = {
  MockERC20: { address: string; abi: Abi }
  FundingPool: { address: string; abi: Abi }
}

const d = deployment as DeploymentJson

export const TESTNET_MOCK_ERC20_ADDRESS = d.MockERC20.address as Address
export const TESTNET_FUNDING_POOL_ADDRESS = d.FundingPool.address as Address
export const TESTNET_MOCK_ERC20_ABI = d.MockERC20.abi
export const TESTNET_FUNDING_POOL_ABI = d.FundingPool.abi
