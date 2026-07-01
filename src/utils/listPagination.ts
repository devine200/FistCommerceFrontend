import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'

export type ListPaginationMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
  remainingItems: number
  hasPrevious: boolean
  hasNext: boolean
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1
  return Math.min(Math.max(1, page), totalPages)
}

export function getListPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number = DASHBOARD_LIST_PAGE_SIZE,
): ListPaginationMeta {
  const safeTotal = Math.max(0, totalItems)
  const totalPages = safeTotal === 0 ? 1 : Math.ceil(safeTotal / pageSize)
  const safePage = clampPage(page, totalPages)
  const startOffset = (safePage - 1) * pageSize
  const endIndex = safeTotal === 0 ? 0 : Math.min(startOffset + pageSize, safeTotal)
  const startIndex = safeTotal === 0 ? 0 : startOffset + 1
  const remainingItems = Math.max(0, safeTotal - endIndex)

  return {
    page: safePage,
    pageSize,
    totalItems: safeTotal,
    totalPages,
    startIndex,
    endIndex,
    remainingItems,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
  }
}

export function paginateListItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number = DASHBOARD_LIST_PAGE_SIZE,
): { pageItems: T[]; meta: ListPaginationMeta } {
  const meta = getListPaginationMeta(items.length, page, pageSize)
  const startOffset = (meta.page - 1) * pageSize
  const pageItems = items.slice(startOffset, startOffset + pageSize)
  return { pageItems, meta }
}

/** Build compact page numbers with ellipses for long page counts. */
export function buildPaginationPageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
  return sorted
}

export function resolvePaginatedListTotal(params: {
  apiTotal?: number | null
  offset: number
  pageSize: number
  resultsLength: number
  statusCount?: number | null
}): number {
  const { apiTotal, offset, pageSize, resultsLength, statusCount } = params

  if (apiTotal != null && apiTotal >= 0) return apiTotal
  if (statusCount != null && statusCount >= 0) return statusCount
  if (resultsLength < pageSize) return offset + resultsLength
  return offset + resultsLength + pageSize
}

export function listPaginationOffset(page: number, pageSize: number = DASHBOARD_LIST_PAGE_SIZE): number {
  return (Math.max(1, page) - 1) * pageSize
}
