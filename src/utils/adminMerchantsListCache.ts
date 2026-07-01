import type {
  AdminMerchantListRow,
  AdminMerchantsTabFilter,
} from '@/api/adminKycMerchants'
import { DASHBOARD_LIST_FETCH_LIMIT } from '@/constants/listPagination'

export const ADMIN_MERCHANTS_FULL_LIST_FILTER = {
  status: 'all',
  limit: DASHBOARD_LIST_FETCH_LIMIT,
  offset: 0,
} as const satisfies { status: AdminMerchantsTabFilter; limit: number; offset: number }

export function adminMerchantsListCacheKey(
  filter: { status?: AdminMerchantsTabFilter; search?: string; limit?: number; offset?: number } = {},
): string {
  const status = filter.status ?? 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_FETCH_LIMIT
  const offset = filter.offset ?? 0
  return `${status}|${search}|${limit}|${offset}`
}

export function filterAdminMerchantsByStatus(
  rows: AdminMerchantListRow[],
  status: AdminMerchantsTabFilter,
): AdminMerchantListRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

export function filterAdminMerchantsBySearch(
  rows: AdminMerchantListRow[],
  query: string,
): AdminMerchantListRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const hay = [
      row.merchant.displayName,
      row.merchant.wallet,
      row.merchant.walletShort,
      row.industry,
      String(row.merchantUserId),
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function adminMerchantListsEqual(a: AdminMerchantListRow[], b: AdminMerchantListRow[]): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    return row.merchantUserId === other.merchantUserId && row.status === other.status
  })
}
