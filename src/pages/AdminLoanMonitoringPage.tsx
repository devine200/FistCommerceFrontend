import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AdminLoanMonitoringStatus } from '@/api/adminLoanMonitoring'
import { useAdminLoanMonitoringDetailHref } from '@/components/admin/useAdminLoanMonitoringDetailHref'
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
  AdminTableTextLink,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminPillVariant,
  type AdminTabItem,
} from '@/components/admin/primitives'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminLoanMonitoring } from '@/store/slices/adminLoanMonitoringSlice'
import {
  adminLoanMonitoringStatusLabel,
  formatAdminLoanMonitoringApr,
  formatAdminLoanMonitoringCount,
  formatAdminLoanMonitoringMoney,
  loanMonitoringPillVariant,
  nextPaymentIsOverdue,
} from '@/utils/mapAdminLoanMonitoringList'
import {
  ADMIN_LOAN_MONITORING_FULL_LIST_FILTER,
  adminLoanMonitoringListCacheKey,
  filterAdminLoanMonitoringBySearch,
  filterAdminLoanMonitoringByStatus,
} from '@/utils/adminLoanMonitoringListCache'
import { shortWalletDisplay } from '@/utils/shortWalletDisplay'

const FULL_LIST_CACHE_KEY = adminLoanMonitoringListCacheKey(ADMIN_LOAN_MONITORING_FULL_LIST_FILTER)

const TABS = ['All', 'Active', 'Late', 'Under Review', 'Repaid', 'Defaulted', 'Rejected'] as const
type TabKey = (typeof TABS)[number]

const TAB_ITEMS: AdminTabItem<TabKey>[] = TABS.map((t) => ({ value: t, label: t }))

const TABLE_HEADERS = ['Receivable Name', 'Merchant', 'Amount', 'APR', 'Status', 'Next Payment', 'Action'] as const

function tabToApiFilter(tab: TabKey) {
  switch (tab) {
    case 'Active':
      return 'active' as const
    case 'Late':
      return 'late' as const
    case 'Under Review':
      return 'under_review' as const
    case 'Repaid':
      return 'repaid' as const
    case 'Defaulted':
      return 'defaulted' as const
    case 'Rejected':
      return 'rejected' as const
    default:
      return 'all' as const
  }
}

function statusPillVariant(status: AdminLoanMonitoringStatus): AdminPillVariant {
  return loanMonitoringPillVariant(status)
}

const AdminLoanMonitoringPage = () => {
  const dispatch = useAppDispatch()
  const loanMonitoringDetailHref = useAdminLoanMonitoringDetailHref()
  const { counts, results, resultsCache, status } = useAppSelector((s) => s.adminLoanMonitoring)
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

  const allLoans = useMemo(() => {
    if (hasFullListCache) return resultsCache[FULL_LIST_CACHE_KEY]
    return results
  }, [hasFullListCache, resultsCache, results])

  const refreshFullList = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshAdminLoanMonitoring({
          ...ADMIN_LOAN_MONITORING_FULL_LIST_FILTER,
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
    () => filterAdminLoanMonitoringByStatus(allLoans, apiFilter),
    [allLoans, apiFilter],
  )

  const filtered = useMemo(
    () => filterAdminLoanMonitoringBySearch(statusFiltered, searchDebounced),
    [statusFiltered, searchDebounced],
  )

  const { pageItems, meta, setPage } = usePaginatedListItems(filtered, [tab, searchDebounced])

  const summaryCards = useMemo(
    () => [
      { title: 'Active Loans', value: formatAdminLoanMonitoringCount(counts.activeLoans) },
      { title: 'Late Payments', value: formatAdminLoanMonitoringMoney(counts.latePaymentsAmount) },
      { title: 'Defaulted Loans', value: formatAdminLoanMonitoringMoney(counts.defaultedLoansAmount) },
      { title: 'Fully Repaid', value: formatAdminLoanMonitoringCount(counts.fullyRepaid) },
    ],
    [counts],
  )

  const tableLoading = status === 'loading' && allLoans.length === 0

  return (
    <AdminPageFrame>
      <AdminStatGrid>
        {summaryCards.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} />
        ))}
      </AdminStatGrid>

      <AdminPanel>
        <AdminToolbarRow
          start={
            <div className="overflow-x-auto max-w-full">
              <AdminSegmentedTabs items={TAB_ITEMS} value={tab} onChange={setTab} />
            </div>
          }
          end={
            <AdminSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search receivable, merchant, or wallet"
              aria-label="Search loans"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1060px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading loans…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  {searchDebounced ? 'No loans match your search.' : 'No loans in this tab yet.'}
                </td>
              </tr>
            ) : (
              pageItems.map((r, idx) => {
                const overdue = nextPaymentIsOverdue(r.nextPayment, r.status)
                return (
                  <tr key={r.loanId} className={adminZebraRowClass(idx)}>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivableName}</td>
                    <td className="px-5 py-5">
                      <AdminPartyStack
                        primary={r.merchant.displayName}
                        secondary={shortWalletDisplay(r.merchant.wallet)}
                        secondaryUnderline
                      />
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-semibold">
                      {formatAdminLoanMonitoringMoney(r.amount)}
                    </td>
                    <td className="px-5 py-5 text-[#16A34A] text-[14px] font-medium">
                      {formatAdminLoanMonitoringApr(r.apr)}
                    </td>
                    <td className="px-5 py-5">
                      <AdminStatusPill variant={statusPillVariant(r.status)}>
                        {r.statusLabel || adminLoanMonitoringStatusLabel(r.status)}
                      </AdminStatusPill>
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={[
                          'text-[14px] font-medium',
                          overdue ? 'text-[#EF4444]' : 'text-[#0B1220]',
                        ].join(' ')}
                      >
                        {r.nextPayment.label?.trim() || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-col items-start gap-2">
                        <AdminTableTextLink to={loanMonitoringDetailHref(r.loanId)}>
                          View Details
                        </AdminTableTextLink>
                        {r.canFund && r.receivableId ? (
                          <AdminTableTextLink to={loanMonitoringDetailHref(r.loanId, 'funding-approval')}>
                            Approve funding
                          </AdminTableTextLink>
                        ) : null}
                        {r.canInitiatePayout && r.receivableId ? (
                          <AdminTableTextLink to={loanMonitoringDetailHref(r.loanId, 'funding-payout')}>
                            Release funds
                          </AdminTableTextLink>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </AdminTableShell>
        <AdminListPagination meta={meta} onPageChange={setPage} loading={tableLoading} />
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminLoanMonitoringPage
