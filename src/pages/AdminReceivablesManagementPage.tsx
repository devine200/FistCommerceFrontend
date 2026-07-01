import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import type { AdminReceivablesTabFilter } from '@/api/adminLoan'
import { usePaginatedListItems } from '@/hooks/usePaginatedListItems'
import {
  AdminListPagination,
  AdminPageFrame,
  AdminPanel,
  AdminPartyStack,
  AdminSearchField,
  AdminSegmentedTabs,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusPill,
  AdminTableHeadRow,
  AdminTableShell,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminPillVariant,
  type AdminTabItem,
} from '@/components/admin/primitives'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminReceivables } from '@/store/slices/adminReceivablesSlice'
import {
  ADMIN_RECEIVABLES_FULL_LIST_FILTER,
  adminReceivablesListCacheKey,
  filterAdminReceivablesBySearch,
  filterAdminReceivablesByStatus,
} from '@/utils/adminReceivablesListCache'

const FULL_LIST_CACHE_KEY = adminReceivablesListCacheKey(ADMIN_RECEIVABLES_FULL_LIST_FILTER)

const TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const
type TabKey = (typeof TABS)[number]

const TAB_ITEMS: AdminTabItem<TabKey>[] = TABS.map((t) => ({ value: t, label: t }))
const TABLE_HEADERS = ['Merchant', 'Receivable', 'Amount', 'Period', 'Status', 'Action'] as const

function tabToApiFilter(tab: TabKey): AdminReceivablesTabFilter {
  switch (tab) {
    case 'Pending':
      return 'pending'
    case 'Under Review':
      return 'under_review'
    case 'Approved':
      return 'approved'
    case 'Rejected':
      return 'rejected'
    default:
      return 'all'
  }
}

function statusPillVariant(status: string): AdminPillVariant {
  switch (status) {
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'under_review':
      return 'underReview'
    case 'pending':
      return 'pending'
    default:
      return 'neutral'
  }
}

const AdminReceivablesManagementPage = () => {
  const dispatch = useAppDispatch()
  const { counts, results, resultsCache, status } = useAppSelector((s) => s.adminReceivables)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)

  const [tab, setTab] = useState<TabKey>('All')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const apiFilter = useMemo(() => tabToApiFilter(tab), [tab])

  const hasFullListCache = Object.prototype.hasOwnProperty.call(resultsCache, FULL_LIST_CACHE_KEY)

  const allReceivables = useMemo(() => {
    if (hasFullListCache) return resultsCache[FULL_LIST_CACHE_KEY]
    return results
  }, [hasFullListCache, resultsCache, results])

  const refreshFullList = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshAdminReceivables({
          ...ADMIN_RECEIVABLES_FULL_LIST_FILTER,
          background,
        }),
      )
    },
    [dispatch],
  )

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    refreshFullList(hasFullListCache)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasFullListCache read at dispatch time only
  }, [accessToken, sessionKind, refreshFullList])

  const statusFiltered = useMemo(
    () => filterAdminReceivablesByStatus(allReceivables, apiFilter),
    [allReceivables, apiFilter],
  )

  const filtered = useMemo(
    () => filterAdminReceivablesBySearch(statusFiltered, searchDebounced),
    [statusFiltered, searchDebounced],
  )

  const { pageItems, meta, setPage } = usePaginatedListItems(filtered, [tab, searchDebounced])

  const summaryCards = useMemo(
    () => [
      { title: 'Pending', value: String(counts.pending) },
      { title: 'Under Review', value: String(counts.underReview) },
      { title: 'Approved', value: String(counts.approved) },
      { title: 'Rejected', value: String(counts.rejected) },
    ],
    [counts],
  )

  const tableLoading = status === 'loading' && allReceivables.length === 0
  const emptyMessage = searchDebounced
    ? 'No receivables match your search.'
    : tab !== 'All'
      ? 'No receivables in this filter.'
      : 'No receivables found.'

  return (
    <AdminPageFrame>
      <AdminStatGrid>
        {summaryCards.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} />
        ))}
      </AdminStatGrid>

      <AdminPanel>
        <AdminToolbarRow
          start={<AdminSegmentedTabs items={TAB_ITEMS} value={tab} onChange={setTab} />}
          end={
            <AdminSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search receivable or merchant"
              aria-label="Search receivables"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[980px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading receivables…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageItems.map((r, idx) => (
                <tr key={r.loanId} className={adminZebraRowClass(idx)}>
                  <td className="px-5 py-5">
                    <AdminPartyStack
                      primary={r.merchant.displayName}
                      secondary={r.merchant.wallet}
                    />
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivable.title}</td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px]">{r.loanAmount}</td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px]">
                    {r.periodDays != null ? `${r.periodDays} days` : '—'}
                  </td>
                  <td className="px-5 py-5">
                    <AdminStatusPill variant={statusPillVariant(r.status)}>{r.status.replace('_', ' ')}</AdminStatusPill>
                  </td>
                  <td className="px-5 py-5">
                    <Link
                      to={`/dashboard/admin/receivables/${r.loanId}`}
                      className="text-[#195EBC] text-[14px] font-semibold hover:underline"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableShell>
        <AdminListPagination meta={meta} onPageChange={setPage} loading={tableLoading} />
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminReceivablesManagementPage
