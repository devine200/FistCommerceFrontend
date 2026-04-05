import type { ActivityLineItem, InvestmentLineItem, InvestorProfileDetail } from '@/components/admin/investors/investorsMockData'

import type { ActivityFilterValue, InvestorProfileStatColumn } from './types'

export const ACTIVITY_FILTER_TABS = [
  { value: 'all' as const, label: 'All' },
  { value: 'deposits' as const, label: 'Deposits' },
  { value: 'withdrawals' as const, label: 'Withdrawals' },
] as const

export function matchesActivityFilter(item: ActivityLineItem, filter: ActivityFilterValue): boolean {
  if (filter === 'all') return true
  if (filter === 'deposits') return item.kind === 'invest'
  if (filter === 'withdrawals') return item.kind === 'withdraw'
  return true
}

export function filterInvestmentLineItems(items: InvestmentLineItem[], query: string): InvestmentLineItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (x) => x.title.toLowerCase().includes(q) || x.dateLabel.toLowerCase().includes(q),
  )
}

export function filterActivityLineItems(
  items: ActivityLineItem[],
  filter: ActivityFilterValue,
  query: string,
): ActivityLineItem[] {
  const q = query.trim().toLowerCase()
  let list = items.filter((x) => matchesActivityFilter(x, filter))
  if (q) {
    list = list.filter((x) => x.title.toLowerCase().includes(q) || x.dateLabel.toLowerCase().includes(q))
  }
  return list
}

/** 3×3 grid: column 1 = account fields, 2 = amounts, 3 = balance / withdrawn + empty row. */
export function buildInvestorProfileStatColumns(profile: InvestorProfileDetail): {
  statColumns: InvestorProfileStatColumn[]
} {
  const col1: InvestorProfileStatColumn = [
    { label: 'Account Status', value: profile.accountStatus },
    { label: 'KYC Status', value: profile.kycLabel },
    { label: 'Date Joined', value: profile.dateJoined },
  ]
  const col2: InvestorProfileStatColumn = [
    { label: 'Total Invested Amount', value: profile.totalInvested },
    { label: 'Active Investments', value: profile.activeInvestmentsTotal },
    { label: 'Total Returns Earned', value: profile.totalReturnsEarned },
  ]
  const col3: InvestorProfileStatColumn = [
    { label: 'Available Balance', value: profile.availableBalance },
    { label: 'Amount Withdrawn', value: profile.amountWithdrawn },
    null,
  ]
  return { statColumns: [col1, col2, col3] }
}
