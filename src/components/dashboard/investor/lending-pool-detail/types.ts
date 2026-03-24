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
  headerStats: PoolStatItem[]
  myStats: PoolStatItem[]
  poolPerformanceStats: PoolStatItem[]
  strategyIntro: string
  strategyFeatures: StrategyFeature[]
  contractRows: ContractField[]
  transactions: RecentTx[]
}
