import { getActiveDeploymentAddresses } from '@/contract_config/deployment'

type DeploymentAddresses = {
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

const d = getActiveDeploymentAddresses() as DeploymentAddresses

export type ProtocolRiskTier = {
  id: number
  interestPercent: string
  maxTenorDays: string
  active: boolean
}

export type ProtocolSafetyState = {
  paused: boolean
}

export type RiskAllocationState = {
  maxMerchantPercent: string
  tiers: ProtocolRiskTier[]
}

export type FundingPoolSettingsState = {
  minDeposit: string
  payoutRouter: string
  acceptedToken: string
  withdrawalRequestDuration: string
  withdrawalRequestGap: string
}

export type PayoutRouterSettingsState = {
  fundingPool: string
  allocator: string
  acceptedToken: string
  minRepayment: string
}

export type RegistryRow = {
  label: string
  value: string
}

export type RegistryGroup = {
  contract: string
  rows: RegistryRow[]
}

export type ProtocolConstantRow = {
  label: string
  value: string
  contract: string
  note: string
}

const ADMIN_PLACEHOLDER = '0x0000000000000000000000000000000000000001'

export const DEFAULT_PROTOCOL_SAFETY: ProtocolSafetyState = {
  paused: false,
}

export const DEFAULT_RISK_ALLOCATION: RiskAllocationState = {
  maxMerchantPercent: '50',
  tiers: [
    { id: 1, interestPercent: '10', maxTenorDays: '90', active: true },
  ],
}

export const DEFAULT_FUNDING_POOL: FundingPoolSettingsState = {
  minDeposit: '100',
  payoutRouter: d.PayoutRouter.address,
  acceptedToken: d.MockERC20.address,
  withdrawalRequestDuration: '2 days',
  withdrawalRequestGap: '20 minutes',
}

export const DEFAULT_PAYOUT_ROUTER: PayoutRouterSettingsState = {
  fundingPool: d.FundingPool.address,
  allocator: d.AllocationController.address,
  acceptedToken: d.MockERC20.address,
  minRepayment: '0 (unused)',
}

export const DEFAULT_CONTRACT_REGISTRY: RegistryGroup[] = [
  {
    contract: 'ProtocolController',
    rows: [{ label: 'admin', value: ADMIN_PLACEHOLDER }],
  },
  {
    contract: 'ComplianceRegistry',
    rows: [
      { label: 'admin', value: ADMIN_PLACEHOLDER },
      { label: 'merchantReceivable', value: d.merchantVerificationNFT.address },
      { label: 'investorReceivable', value: d.investorVerificationNFT.address },
      { label: 'protocolController', value: d.ProtocolController.address },
    ],
  },
  {
    contract: 'AllocationController',
    rows: [
      { label: 'admin', value: ADMIN_PLACEHOLDER },
      { label: 'complianceRegistry', value: d.ComplianceRegistry.address },
      { label: 'protocolController', value: d.ProtocolController.address },
      { label: 'receivableToken', value: d.loanVerificationNFT.address },
      { label: 'maxMerchantBps (deploy)', value: '5000 (50%)' },
    ],
  },
  {
    contract: 'FundingPool',
    rows: [
      { label: 'admin', value: ADMIN_PLACEHOLDER },
      { label: 'allocator', value: d.AllocationController.address },
      { label: 'complianceRegistry', value: d.ComplianceRegistry.address },
      { label: 'payoutRouter', value: d.PayoutRouter.address },
      { label: 'protocolController', value: d.ProtocolController.address },
      { label: 'acceptedToken', value: d.MockERC20.address },
    ],
  },
  {
    contract: 'PayoutRouter',
    rows: [
      { label: 'admin', value: ADMIN_PLACEHOLDER },
      { label: 'fundingPool', value: d.FundingPool.address },
      { label: 'allocator', value: d.AllocationController.address },
      { label: 'acceptedToken', value: d.MockERC20.address },
      { label: 'protocolController', value: d.ProtocolController.address },
    ],
  },
  {
    contract: 'ReceivableToken',
    rows: [
      { label: 'name', value: 'Fist Receivable' },
      { label: 'symbol', value: 'FREC' },
      { label: 'transfers', value: 'Disabled (non-zero transfers revert)' },
    ],
  },
]

export const DEFAULT_PROTOCOL_CONSTANTS: ProtocolConstantRow[] = [
  {
    label: 'BANKER_YEAR',
    value: '360',
    contract: 'AllocationController',
    note: 'Interest day count',
  },
  {
    label: 'withdrawalRequestDuration',
    value: '2 days',
    contract: 'FundingPool',
    note: 'Approved withdrawal validity window',
  },
  {
    label: 'withdrawalRequestGap',
    value: '20 minutes',
    contract: 'FundingPool',
    note: 'Minimum time between withdrawal requests',
  },
  {
    label: 'minRepayment',
    value: '0 (declared, unused)',
    contract: 'PayoutRouter',
    note: 'No setter in contract',
  },
]
