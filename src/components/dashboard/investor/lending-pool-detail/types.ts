export type PoolStatItem = { label: string; value: string; hint?: string }

export type StrategyFeature = {
  title: string
  description: string
  icon: 'clock' | 'briefcase' | 'target' | 'shield'
}

export type ContractField = {
  label: string
  value: string
  badge?: string
  /** Full string copied when user clicks Copy (e.g. contract address) */
  copyValue?: string
}

export type RecentTx = {
  id: string
  walletShort: string
  type: string
  amount: string
  amountTone: 'positive' | 'negative' | 'neutral'
  timeAgo: string
  /** When set, address chip links here — prefer explorer `/tx/0x…` when `transaction_hash` exists. */
  walletExplorerHref?: string | null
}

export type InvestorPoolTopBarConfig = {
  /** Truncated address shown in header wallet chip */
  walletDisplay: string
  showUnreadNotification?: boolean
}

export type InvestorPoolDetailConfig = {
  title: string
  subtitle: string
  /** Optional header chrome for lending pool detail (wallet chip, notification dot, muted breadcrumbs) */
  topBar?: InvestorPoolTopBarConfig
  /** Hero row — overridden from pool metrics API when available */
  headerStats: PoolStatItem[]
  /** Investor row — overridden from investor metrics API when available */
  myStats: PoolStatItem[]
  poolPerformanceStats: PoolStatItem[]
  strategyIntro: string
  strategyFeatures: StrategyFeature[]
  contractRows: ContractField[]
  transactions: RecentTx[]
  /** Pool contract on Sepolia (or API-provided explorer) — “View on Etherscan” target. */
  contractExplorerHref?: string | null
}
