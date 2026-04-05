import type { ActivityLineItem, InvestmentLineItem } from '@/components/admin/investors/investorsMockData'

export type StatPair = {
  label: string
  value: string
}

export type AdminInvestorProfileBreadcrumbProps = {
  listHref: string
  listLabel?: string
  currentLabel?: string
}

/** One metrics column (design: 3 columns × 3 rows; use `null` for an empty cell). */
export type InvestorProfileStatColumn = (StatPair | null)[]

export type AdminInvestorProfileSummaryProps = {
  avatarSrc: string
  avatarAlt?: string
  displayName: string
  walletLabel: string
  statColumns: InvestorProfileStatColumn[]
}

export type AdminInvestorInvestmentListPanelProps = {
  investorId: string
  title: string
  items: InvestmentLineItem[]
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchAriaLabel?: string
}

export type ActivityFilterValue = 'all' | 'deposits' | 'withdrawals'

export type ActivityFilterTab = {
  value: ActivityFilterValue
  label: string
}

export type AdminInvestorActivityPanelProps = {
  investorId: string
  items: ActivityLineItem[]
  searchValue: string
  onSearchChange: (value: string) => void
  activityFilter: ActivityFilterValue
  onActivityFilterChange: (value: ActivityFilterValue) => void
  filterTabs: ActivityFilterTab[]
  searchPlaceholder?: string
  searchAriaLabel?: string
}
