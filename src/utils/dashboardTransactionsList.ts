import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { resolvePaginatedListTotal } from '@/utils/listPagination'

export type DashboardTransactionsListParams = {
  limit?: number
  offset?: number
  type?: string
  search?: string
}

export type DashboardTransactionsListResult<T> = {
  transactions: T[]
  total: number
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

export function dashboardTransactionsListCacheKey(
  prefix: string,
  filter: DashboardTransactionsListParams = {},
): string {
  const type = filter.type?.trim() || 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_PAGE_SIZE
  const offset = filter.offset ?? 0
  return `${prefix}|${type}|${search}|${limit}|${offset}`
}

export function normalizeDashboardTransactionsListResponse<T>(
  raw: unknown,
  params: { offset: number; limit: number },
  mapRow: (row: unknown) => T | null,
): DashboardTransactionsListResult<T> {
  const record = asRecord(raw)
  const rawRows = Array.isArray(record.transactions)
    ? record.transactions
    : Array.isArray(record.results)
      ? record.results
      : Array.isArray(raw)
        ? raw
        : []

  const transactions: T[] = []
  for (const row of rawRows) {
    const mapped = mapRow(row)
    if (mapped) transactions.push(mapped)
  }

  const apiTotal = pickNumber(record, 'total', 'count')
  const total =
    apiTotal ??
    resolvePaginatedListTotal({
      apiTotal,
      offset: params.offset,
      pageSize: params.limit,
      resultsLength: transactions.length,
    })

  return { transactions, total }
}

export function dashboardTransactionListsEqual<T extends { id?: string; transaction_hash?: string }>(
  a: readonly T[],
  b: readonly T[],
): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    const leftId = row.id ?? row.transaction_hash
    const rightId = other.id ?? other.transaction_hash
    return leftId === rightId
  })
}
