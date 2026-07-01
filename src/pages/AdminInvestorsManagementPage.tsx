import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { AdminInvestorListStatus } from '@/api/adminKycInvestors'
import { AdminKycPendingGovernanceBadge } from '@/components/admin/kyc/AdminKycPendingGovernanceBadge'
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
import { usePaginatedListItems } from '@/hooks/usePaginatedListItems'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminInvestors } from '@/store/slices/adminInvestorsSlice'
import {
  adminInvestorStatusLabel,
  formatAdminInvestorMoney,
  formatAdminInvestorReceivablesCount,
  formatAdminInvestorsCount,
} from '@/utils/mapAdminInvestorsList'
import {
  ADMIN_INVESTORS_FULL_LIST_FILTER,
  adminInvestorsListCacheKey,
  filterAdminInvestorsBySearch,
  filterAdminInvestorsByStatus,
} from '@/utils/adminInvestorsListCache'
import { shortWalletDisplay } from '@/utils/shortWalletDisplay'

const FULL_LIST_CACHE_KEY = adminInvestorsListCacheKey(ADMIN_INVESTORS_FULL_LIST_FILTER)

const TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const
type TabKey = (typeof TABS)[number]

const TAB_ITEMS: AdminTabItem<TabKey>[] = TABS.map((t) => ({ value: t, label: t }))

const TABLE_HEADERS = [
  'Investor',
  'Invested',
  'Earnings',
  'Amount Withdrawn',
  'KYC Status',
  'No. of Receivables',
  'Action',
] as const

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

function investorPillVariant(status: AdminInvestorListStatus): AdminPillVariant {
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

const AdminInvestorsManagementPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { counts, results, resultsCache, status } = useAppSelector((s) => s.adminInvestors)
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

  const allInvestors = useMemo(() => {
    if (hasFullListCache) return resultsCache[FULL_LIST_CACHE_KEY]
    return results
  }, [hasFullListCache, resultsCache, results])

  const refreshFullList = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshAdminInvestors({
          ...ADMIN_INVESTORS_FULL_LIST_FILTER,
          background,
        }),
      )
    },
    [dispatch],
  )

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    refreshFullList(hasFullListCache)
    // Load full list once per visit; status tabs filter client-side only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasFullListCache read at dispatch time only
  }, [accessToken, sessionKind, refreshFullList])

  const statusFiltered = useMemo(
    () => filterAdminInvestorsByStatus(allInvestors, apiFilter),
    [allInvestors, apiFilter],
  )

  const filtered = useMemo(
    () => filterAdminInvestorsBySearch(statusFiltered, searchDebounced),
    [statusFiltered, searchDebounced],
  )

  const { pageItems, meta, setPage } = usePaginatedListItems(filtered, [tab, searchDebounced])

  const summaryCards = useMemo(
    () => [
      { title: 'Total Investors', value: formatAdminInvestorsCount(counts.totalInvestors) },
      { title: 'Total Invested', value: formatAdminInvestorMoney(counts.totalInvested) },
      { title: 'Total Earnings Paid', value: formatAdminInvestorMoney(counts.totalEarningsPaid) },
      { title: 'Frozen Accounts', value: formatAdminInvestorsCount(counts.frozenAccounts) },
    ],
    [counts],
  )

  const tableLoading = status === 'loading' && allInvestors.length === 0
  const emptyMessage = searchDebounced
    ? 'No investors match your search.'
    : tab !== 'All'
      ? 'No investors in this tab yet.'
      : 'No investors found.'

  const openProfile = (investorUserId: number) => {
    navigate(`/dashboard/admin/investors/${investorUserId}`)
  }

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
              placeholder="Search by name, email, or wallet"
              aria-label="Search investors"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1120px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading investors…
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
                <tr
                  key={r.investorUserId}
                  className={[adminZebraRowClass(idx), 'cursor-pointer hover:bg-[#F3F7FC]/80 transition-colors'].join(' ')}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open profile for ${r.investor.displayName}`}
                  onClick={() => openProfile(r.investorUserId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openProfile(r.investorUserId)
                    }
                  }}
                >
                  <td className="px-5 py-5">
                    <AdminPartyStack
                      primary={r.investor.displayName}
                      secondary={shortWalletDisplay(r.investor.wallet)}
                    />
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminInvestorMoney(r.invested)}
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminInvestorMoney(r.earnings)}
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminInvestorMoney(r.amountWithdrawn)}
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-col gap-2 items-start">
                      <AdminStatusPill variant={investorPillVariant(r.status)}>
                        {r.statusLabel || adminInvestorStatusLabel(r.status)}
                      </AdminStatusPill>
                      <AdminKycPendingGovernanceBadge proposalId={r.pendingMultisigProposalId} />
                    </div>
                  </td>
                  <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                    {formatAdminInvestorReceivablesCount(r.receivablesCount)}
                  </td>
                  <td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
                    <AdminTableTextLink
                      to={`/dashboard/admin/investors/${r.investorUserId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View profile
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

export default AdminInvestorsManagementPage
