import type {
  AdminTransactionRow,
  AdminTransactionTabFilter,
  FetchAdminTransactionsParams,
} from '@/api/adminTransactions'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'

export const ADMIN_TRANSACTIONS_FULL_LIST_FILTER = {
  status: 'all',
  type: 'all',
} as const satisfies FetchAdminTransactionsParams

export function adminTransactionsListCacheKey(filter: FetchAdminTransactionsParams = {}): string {
  const status = filter.status ?? 'all'
  const type = filter.type ?? 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_PAGE_SIZE
  const offset = filter.offset ?? 0
  return `${status}|${type}|${search}|${limit}|${offset}`
}

export function adminTransactionListsEqual(
  a: AdminTransactionRow[],
  b: AdminTransactionRow[],
): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    return row.id === other.id && row.status === other.status
  })
}

export type { AdminTransactionTabFilter }
