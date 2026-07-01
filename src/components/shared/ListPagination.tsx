import { buildPaginationPageNumbers } from '@/utils/listPagination'
import type { ListPaginationMeta } from '@/utils/listPagination'

export type ListPaginationProps = {
  meta: ListPaginationMeta
  onPageChange: (page: number) => void
  loading?: boolean
  className?: string
  variant?: 'admin' | 'dashboard'
}

function buttonClassName(active: boolean, variant: ListPaginationProps['variant']): string {
  const base =
    'min-w-[36px] h-9 px-2 rounded-[6px] text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  if (active) {
    return variant === 'dashboard'
      ? `${base} bg-[#195EBC] text-white`
      : `${base} bg-[#195EBC] text-white`
  }
  return variant === 'dashboard'
    ? `${base} text-[#4D5D80] hover:bg-[#F3F4F6]`
    : `${base} text-[#0B1220] hover:bg-[#F3F7FC]`
}

export function ListPagination({
  meta,
  onPageChange,
  loading = false,
  className = '',
  variant = 'admin',
}: ListPaginationProps) {
  if (meta.totalItems <= meta.pageSize) return null

  const pageNumbers = buildPaginationPageNumbers(meta.page, meta.totalPages)
  const summary =
    meta.totalItems === 0
      ? 'No results'
      : `Showing ${meta.startIndex.toLocaleString()}–${meta.endIndex.toLocaleString()} of ${meta.totalItems.toLocaleString()}${
          meta.remainingItems > 0 ? ` · ${meta.remainingItems.toLocaleString()} remaining` : ''
        }`

  return (
    <div
      className={[
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-t border-[#E6E8EC]',
        className,
      ].join(' ')}
    >
      <p className="text-[#6B7488] text-[13px]">{summary}</p>
      <nav aria-label="Table pagination" className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          className={buttonClassName(false, variant)}
          disabled={loading || !meta.hasPrevious}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          Prev
        </button>
        {pageNumbers.map((pageNumber, index) => {
          const prev = pageNumbers[index - 1]
          const showEllipsis = prev != null && pageNumber - prev > 1
          return (
            <span key={pageNumber} className="inline-flex items-center gap-1">
              {showEllipsis ? <span className="px-1 text-[#6B7488] text-[13px]">…</span> : null}
              <button
                type="button"
                className={buttonClassName(pageNumber === meta.page, variant)}
                disabled={loading}
                aria-current={pageNumber === meta.page ? 'page' : undefined}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            </span>
          )
        })}
        <button
          type="button"
          className={buttonClassName(false, variant)}
          disabled={loading || !meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  )
}
