import { useCallback, useEffect, useMemo } from 'react'

import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { getListPaginationMeta, listPaginationOffset } from '@/utils/listPagination'

import { useListPageState } from './useListPageState'

type UseAdminPaginatedListFetchArgs<TRefreshParams> = {
  enabled: boolean
  resetDeps: readonly unknown[]
  cacheKey: string
  hasPageCache: boolean
  total: number
  loading: boolean
  resultsLength: number
  buildRefreshParams: (offset: number, background: boolean) => TRefreshParams
  onRefresh: (params: TRefreshParams) => void
  pageSize?: number
}

export function useAdminPaginatedListFetch<TRefreshParams>({
  enabled,
  resetDeps,
  hasPageCache,
  total,
  loading,
  resultsLength,
  buildRefreshParams,
  onRefresh,
  pageSize = DASHBOARD_LIST_PAGE_SIZE,
}: UseAdminPaginatedListFetchArgs<TRefreshParams>) {
  const [page, setPage] = useListPageState(resetDeps)
  const offset = listPaginationOffset(page, pageSize)

  const refreshParams = useMemo(
    () => buildRefreshParams(offset, hasPageCache),
    [buildRefreshParams, offset, hasPageCache],
  )

  useEffect(() => {
    if (!enabled) return
    onRefresh(refreshParams)
  }, [enabled, onRefresh, refreshParams])

  const meta = useMemo(() => getListPaginationMeta(total, page, pageSize), [total, page, pageSize])
  const tableLoading = loading && resultsLength === 0 && !hasPageCache

  return {
    page,
    setPage,
    meta,
    tableLoading,
    offset,
  }
}

export function useAdminPaginatedRefreshCallback<TRefreshParams>(
  dispatch: (params: TRefreshParams) => unknown,
) {
  return useCallback((params: TRefreshParams) => {
    void dispatch(params)
  }, [dispatch])
}
