import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AdminMerchantListStatus } from '@/api/adminKycMerchants'
import { AdminKycPendingGovernanceBadge } from '@/components/admin/kyc/AdminKycPendingGovernanceBadge'
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
import { refreshAdminMerchants } from '@/store/slices/adminMerchantsSlice'
import {
  adminMerchantStatusLabel,
  formatAdminMerchantMoney,
  formatAdminMerchantReceivablesCount,
  formatAdminMerchantsCount,
} from '@/utils/mapAdminMerchantsList'
import {
  ADMIN_MERCHANTS_FULL_LIST_FILTER,
  adminMerchantsListCacheKey,
  filterAdminMerchantsBySearch,
  filterAdminMerchantsByStatus,
} from '@/utils/adminMerchantsListCache'

const FULL_LIST_CACHE_KEY = adminMerchantsListCacheKey(ADMIN_MERCHANTS_FULL_LIST_FILTER)

const TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const
type TabKey = (typeof TABS)[number]

const TAB_ITEMS: AdminTabItem<TabKey>[] = TABS.map((t) => ({ value: t, label: t }))

const TABLE_HEADERS = ['Merchant', 'Industry', 'Total Loans', 'Current Debt Owed', 'Status', 'No. of Receivables', 'Action'] as const

function tabToApiFilter(tab: TabKey) {
  switch (tab) {
    case 'Pending':
      return 'pending' as const
    case 'Under Review':
      return 'under_review' as const
    case 'Approved':
      return 'approved' as const
    case 'Rejected':
      return 'rejected' as const
    default:
      return 'all' as const
  }
}

function merchantPillVariant(status: AdminMerchantListStatus): AdminPillVariant {
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

const AdminMerchantsManagementPage = () => {
  const dispatch = useAppDispatch()
  const { counts, results, resultsCache, status } = useAppSelector((s) => s.adminMerchants)
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

  const allMerchants = useMemo(() => {
    if (hasFullListCache) return resultsCache[FULL_LIST_CACHE_KEY]
    return results
  }, [hasFullListCache, resultsCache, results])

  const refreshFullList = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshAdminMerchants({
          ...ADMIN_MERCHANTS_FULL_LIST_FILTER,
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
    () => filterAdminMerchantsByStatus(allMerchants, apiFilter),
    [allMerchants, apiFilter],
  )

  const filtered = useMemo(
    () => filterAdminMerchantsBySearch(statusFiltered, searchDebounced),
    [statusFiltered, searchDebounced],
  )

  const { pageItems, meta, setPage } = usePaginatedListItems(filtered, [tab, searchDebounced])

  const summaryCards = useMemo(
    () => [
      { title: 'Total Merchants', value: formatAdminMerchantsCount(counts.totalMerchants) },
      { title: 'Active Merchants', value: formatAdminMerchantsCount(counts.activeMerchants) },
      { title: 'Under Review', value: formatAdminMerchantsCount(counts.underReview) },
      { title: 'Rejected Merchants', value: formatAdminMerchantsCount(counts.rejectedMerchants) },
    ],
    [counts],
  )

  const tableLoading = status === 'loading' && allMerchants.length === 0
  const emptyMessage = searchDebounced
    ? 'No merchants match your search.'
    : tab !== 'All'
      ? 'No merchants in this tab yet.'
      : 'No merchants found.'

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
              placeholder="Search for a merchant."
              aria-label="Search for a merchant"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1060px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading merchants…
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
                <tr key={r.merchantUserId} className={adminZebraRowClass(idx)}>
                  <td className="px-5 py-5">
                    <AdminPartyStack
                      primary={r.merchant.displayName}
                      secondary={r.merchant.walletShort || r.merchant.wallet}
                    />
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.industry}</td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminMerchantMoney(r.totalLoans)}
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminMerchantMoney(r.currentDebtOwed)}
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-col gap-2 items-start">
                      <AdminStatusPill variant={merchantPillVariant(r.status)}>
                        {adminMerchantStatusLabel(r.status)}
                      </AdminStatusPill>
                      <AdminKycPendingGovernanceBadge proposalId={r.pendingMultisigProposalId} />
                    </div>
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminMerchantReceivablesCount(r.receivablesCount)}
                  </td>
                  <td className="px-5 py-5">
                    <AdminTableTextLink to={`/dashboard/admin/merchants/${r.merchantUserId}`}>
                      View Details
                    </AdminTableTextLink>
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

export default AdminMerchantsManagementPage
