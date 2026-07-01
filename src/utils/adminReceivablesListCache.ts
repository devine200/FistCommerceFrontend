import type {
  AdminReceivableListRow,
  AdminReceivablesTabFilter,
} from '@/api/adminLoan'
import { DASHBOARD_LIST_FETCH_LIMIT } from '@/constants/listPagination'

export const ADMIN_RECEIVABLES_FULL_LIST_FILTER = {
  status: 'all',
  limit: DASHBOARD_LIST_FETCH_LIMIT,
  offset: 0,
} as const satisfies { status: AdminReceivablesTabFilter; limit: number; offset: number }

export function adminReceivablesListCacheKey(
  filter: { status?: AdminReceivablesTabFilter; search?: string; limit?: number; offset?: number } = {},
): string {
  const status = filter.status ?? 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_FETCH_LIMIT
  const offset = filter.offset ?? 0
  return `${status}|${search}|${limit}|${offset}`
}

export function filterAdminReceivablesByStatus(
  rows: AdminReceivableListRow[],
  status: AdminReceivablesTabFilter,
): AdminReceivableListRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

export function filterAdminReceivablesBySearch(
  rows: AdminReceivableListRow[],
  query: string,
): AdminReceivableListRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const hay = [
      row.merchant.displayName,
      row.merchant.wallet,
      row.merchant.businessName,
      row.receivable.title,
      row.loanAmount,
      row.loanId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function adminReceivableListsEqual(
  a: AdminReceivableListRow[],
  b: AdminReceivableListRow[],
): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    return row.loanId === other.loanId && row.status === other.status
  })
}
