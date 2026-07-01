import type {
  AdminInvestorListRow,
  AdminInvestorsTabFilter,
} from '@/api/adminKycInvestors'
import { DASHBOARD_LIST_FETCH_LIMIT } from '@/constants/listPagination'

/** Full-list cache query — tabs and search filter this list client-side. */
export const ADMIN_INVESTORS_FULL_LIST_FILTER = {
  status: 'all',
  limit: DASHBOARD_LIST_FETCH_LIMIT,
  offset: 0,
} as const satisfies { status: AdminInvestorsTabFilter; limit: number; offset: number }

export function adminInvestorsListCacheKey(
  filter: { status?: AdminInvestorsTabFilter; search?: string; limit?: number; offset?: number } = {},
): string {
  const status = filter.status ?? 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_FETCH_LIMIT
  const offset = filter.offset ?? 0
  return `${status}|${search}|${limit}|${offset}`
}

export function filterAdminInvestorsByStatus(
  rows: AdminInvestorListRow[],
  status: AdminInvestorsTabFilter,
): AdminInvestorListRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

export function filterAdminInvestorsBySearch(
  rows: AdminInvestorListRow[],
  query: string,
): AdminInvestorListRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const hay = [
      row.investor.displayName,
      row.investor.wallet,
      row.statusLabel,
      String(row.investorUserId),
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function adminInvestorListsEqual(a: AdminInvestorListRow[], b: AdminInvestorListRow[]): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    return (
      row.investorUserId === other.investorUserId &&
      row.status === other.status &&
      row.pendingMultisigProposalId === other.pendingMultisigProposalId
    )
  })
}
