import { useMemo } from 'react'

import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { paginateListItems } from '@/utils/listPagination'

import { useListPageState } from './useListPageState'

export function usePaginatedListItems<T>(
  items: readonly T[],
  resetDeps: readonly unknown[],
  pageSize: number = DASHBOARD_LIST_PAGE_SIZE,
) {
  const [page, setPage] = useListPageState(resetDeps)

  const { pageItems, meta } = useMemo(
    () => paginateListItems(items, page, pageSize),
    [items, page, pageSize],
  )

  return {
    page,
    setPage,
    pageItems,
    meta,
  }
}
