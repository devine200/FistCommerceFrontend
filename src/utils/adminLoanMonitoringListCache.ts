import type {
  AdminLoanMonitoringRow,
  AdminLoanMonitoringTabFilter,
} from '@/api/adminLoanMonitoring'
import { DASHBOARD_LIST_FETCH_LIMIT } from '@/constants/listPagination'

export const ADMIN_LOAN_MONITORING_FULL_LIST_FILTER = {
  status: 'all',
  limit: DASHBOARD_LIST_FETCH_LIMIT,
  offset: 0,
} as const satisfies { status: AdminLoanMonitoringTabFilter; limit: number; offset: number }

export function adminLoanMonitoringListCacheKey(
  filter: { status?: AdminLoanMonitoringTabFilter; search?: string; limit?: number; offset?: number } = {},
): string {
  const status = filter.status ?? 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_FETCH_LIMIT
  const offset = filter.offset ?? 0
  return `${status}|${search}|${limit}|${offset}`
}

export function filterAdminLoanMonitoringByStatus(
  rows: AdminLoanMonitoringRow[],
  status: AdminLoanMonitoringTabFilter,
): AdminLoanMonitoringRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

export function filterAdminLoanMonitoringBySearch(
  rows: AdminLoanMonitoringRow[],
  query: string,
): AdminLoanMonitoringRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const hay = [
      row.receivableName,
      row.merchant.displayName,
      row.merchant.wallet,
      row.loanId,
      row.statusLabel,
      row.amount,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function adminLoanMonitoringListsEqual(
  a: AdminLoanMonitoringRow[],
  b: AdminLoanMonitoringRow[],
): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    return row.loanId === other.loanId && row.status === other.status
  })
}
