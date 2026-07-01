import { useCallback, useEffect, useMemo, useState } from 'react'

import AdminTransactionDetailText from '@/components/admin/transactions/AdminTransactionDetailText'
import AdminTransactionDetailsModal, {
  type AdminTransactionDetail,
} from '@/components/admin/transactions/AdminTransactionDetailsModal'
import AdminTransactionTypeBadge from '@/components/admin/transactions/AdminTransactionTypeBadge'
import {
  AdminListPagination,
  AdminPageFrame,
  AdminPanel,
  AdminSearchField,
  AdminSegmentedTabs,
  AdminStatCard,
  AdminStatGrid,
  AdminTableHeadRow,
  AdminTableShell,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminTabItem,
} from '@/components/admin/primitives'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { useListPageState } from '@/hooks/useListPageState'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminTransactions } from '@/store/slices/adminTransactionsSlice'
import {
  formatAdminTransactionsSummaryMoney,
  mapAdminTransactionModalToDetail,
  tabToAdminTransactionStatusFilter,
} from '@/utils/mapAdminTransactionsList'
import { adminTransactionsListCacheKey } from '@/utils/adminTransactionsListCache'
import { getListPaginationMeta, listPaginationOffset } from '@/utils/listPagination'

const STATUS_TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const
type StatusTabKey = (typeof STATUS_TABS)[number]

const STATUS_TAB_ITEMS: AdminTabItem<StatusTabKey>[] = STATUS_TABS.map((t) => ({ value: t, label: t }))

const TX_TABLE_HEADERS = ['Transaction ID', 'Type', 'Detail', 'Amount', 'Date', 'Action'] as const

const AdminTransactionsPage = () => {
  const dispatch = useAppDispatch()
  const { summary, results, resultsCache, status, total } = useAppSelector((s) => s.adminTransactions)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)

  const [statusTab, setStatusTab] = useState<StatusTabKey>('All')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selectedDetail, setSelectedDetail] = useState<AdminTransactionDetail | null>(null)
  const [page, setPage] = useListPageState([statusTab, searchDebounced])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const apiStatusFilter = useMemo(() => tabToAdminTransactionStatusFilter(statusTab), [statusTab])
  const offset = listPaginationOffset(page)

  const pageQuery = useMemo(
    () => ({
      status: apiStatusFilter,
      type: 'all' as const,
      search: searchDebounced || undefined,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      offset,
    }),
    [apiStatusFilter, searchDebounced, offset],
  )

  const pageCacheKey = adminTransactionsListCacheKey(pageQuery)
  const hasPageCache = Object.prototype.hasOwnProperty.call(resultsCache, pageCacheKey)

  const refreshPage = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshAdminTransactions({
          ...pageQuery,
          background,
        }),
      )
    },
    [dispatch, pageQuery],
  )

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    refreshPage(hasPageCache)
  }, [accessToken, sessionKind, refreshPage, hasPageCache])

  const meta = useMemo(() => getListPaginationMeta(total, page), [total, page])

  const summaryCards = useMemo(
    () => [
      { title: 'Deposits', value: formatAdminTransactionsSummaryMoney(summary.deposits) },
      { title: 'Withdrawals', value: formatAdminTransactionsSummaryMoney(summary.withdrawals) },
      { title: 'Disbursements', value: formatAdminTransactionsSummaryMoney(summary.disbursements) },
      { title: 'Repayments', value: formatAdminTransactionsSummaryMoney(summary.repayments) },
    ],
    [summary],
  )

  const tableLoading = status === 'loading' && results.length === 0 && !hasPageCache
  const emptyMessage = searchDebounced
    ? 'No transactions match your search.'
    : statusTab !== 'All'
      ? 'No transactions in this tab yet.'
      : 'No transactions yet.'

  const openDetail = (modal: AdminTransactionDetail) => setSelectedDetail(modal)

  return (
    <AdminPageFrame>
      <AdminStatGrid columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} titleTone="muted" />
        ))}
      </AdminStatGrid>

      <AdminPanel>
        <AdminToolbarRow
          start={
            <div className="overflow-x-auto max-w-full">
              <AdminSegmentedTabs items={STATUS_TAB_ITEMS} value={statusTab} onChange={setStatusTab} />
            </div>
          }
          end={
            <AdminSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search for a transaction"
              aria-label="Search for a transaction"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1000px]">
          <AdminTableHeadRow labels={TX_TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TX_TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading transactions…
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={TX_TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              results.map((r, idx) => {
                const modalDetail = mapAdminTransactionModalToDetail(r.modal)
                return (
                  <tr
                    key={r.id}
                    className={[adminZebraRowClass(idx), 'cursor-pointer hover:bg-[#E8EFF8]/80 transition-colors'].join(' ')}
                    onClick={() => openDetail(modalDetail)}
                  >
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.transactionId}</td>
                    <td className="px-5 py-5 align-top">
                      <AdminTransactionTypeBadge type={r.type} typeLabel={r.typeLabel} />
                    </td>
                    <td className="px-5 py-5 align-top">
                      <AdminTransactionDetailText detail={r.detail} />
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.amountDisplay}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.dateDisplay}</td>
                    <td className="px-5 py-5 align-top">
                      <button
                        type="button"
                        className="text-[#195EBC] text-[14px] underline underline-offset-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(modalDetail)
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </AdminTableShell>
        <AdminListPagination meta={meta} onPageChange={setPage} loading={status === 'loading'} />
      </AdminPanel>

      <AdminTransactionDetailsModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </AdminPageFrame>
  )
}

export default AdminTransactionsPage
