import type {
  AdminInvestorActivityLineRow,
  AdminInvestorInvestmentLineRow,
  AdminInvestorListStatus,
  AdminInvestorProfileResult,
} from '@/api/adminKycInvestors'
import { displayDashboardMetricString } from '@/api/metrics'
import type {
  ActivityKind,
  ActivityLineItem,
  InvestmentLineItem,
  InvestorProfileDetail,
} from '@/components/admin/investors/investorsMockData'
import { shortWalletDisplay } from '@/utils/shortWalletDisplay'

export function adminInvestorStatusLabel(status: AdminInvestorListStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'under_review':
      return 'Under Review'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return status
  }
}

export function formatAdminInvestorsCount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatAdminInvestorMoney(amount: string): string {
  return displayDashboardMetricString(amount)
}

export function formatAdminInvestorReceivablesCount(count: number): string {
  if (!Number.isFinite(count)) return '—'
  const n = Math.max(0, Math.round(count))
  return `${n.toLocaleString('en-US')} Receivable${n === 1 ? '' : 's'}`
}

function formatIsoDateForDisplay(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—'
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return iso.trim()
}

function mapActivityKind(activityType: string): ActivityKind {
  const t = activityType.trim().toLowerCase()
  if (t === 'withdrawal') return 'withdraw'
  if (t === 'earnings') return 'earn'
  return 'invest'
}

function formatActivityAmountDisplay(
  amount: string,
  activityType: string,
  amountTone: string,
): string {
  const formatted = formatAdminInvestorMoney(amount)
  const t = activityType.trim().toLowerCase()
  if (t === 'earnings' || amountTone === 'success') {
    if (formatted.startsWith('+')) return formatted
    return `+${formatted}`
  }
  if (t === 'withdrawal' || amountTone === 'warning') {
    if (formatted.startsWith('-')) return formatted
    return `-${formatted.replace(/^\+/, '')}`
  }
  return formatted
}

function mapInvestmentLineItem(row: AdminInvestorInvestmentLineRow): InvestmentLineItem {
  return {
    id: row.id,
    title: row.title,
    dateLabel: formatIsoDateForDisplay(row.date),
    amount: formatAdminInvestorMoney(row.amount),
  }
}

function mapActivityLineItem(row: AdminInvestorActivityLineRow): ActivityLineItem {
  const kind = mapActivityKind(row.activityType)
  return {
    id: row.id,
    kind,
    title: row.title,
    dateLabel: formatIsoDateForDisplay(row.date),
    amountDisplay: formatActivityAmountDisplay(row.amount, row.activityType, row.amountTone),
  }
}

export function mapAdminInvestorProfileToDetail(detail: AdminInvestorProfileResult): InvestorProfileDetail {
  const { profile, summary, activeInvestments, investmentHistory, activity } = detail

  return {
    id: String(profile.investorUserId),
    kycId: profile.kycId,
    displayName: profile.displayName,
    wallet: profile.wallet,
    walletLabel: shortWalletDisplay(profile.wallet),
    email: '',
    accountStatus: profile.accountStatusLabel === 'Inactive' ? 'Inactive' : 'Active',
    kycLabel: profile.kycStatusLabel,
    pendingMultisigProposalId: profile.pendingMultisigProposalId,
    dateJoined: formatIsoDateForDisplay(profile.dateJoined),
    totalInvested: formatAdminInvestorMoney(summary.totalInvestedAmount),
    activeInvestmentsTotal: formatAdminInvestorMoney(summary.activeInvestmentsTotal),
    totalReturnsEarned: formatAdminInvestorMoney(summary.totalReturnsEarned),
    availableBalance: formatAdminInvestorMoney(summary.availableBalance),
    amountWithdrawn: formatAdminInvestorMoney(summary.amountWithdrawn),
    activeInvestmentsCount: activeInvestments.count,
    investmentHistoryCount: investmentHistory.count,
    activityCount: activity.count,
    activeInvestments: activeInvestments.results.map(mapInvestmentLineItem),
    investmentHistory: investmentHistory.results.map(mapInvestmentLineItem),
    activity: activity.results.map(mapActivityLineItem),
  }
}
