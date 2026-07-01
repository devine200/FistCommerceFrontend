import { useCallback, useEffect, useMemo, useState } from 'react'

import { resolveAdminWriteOutcome } from '@/admin/governance/resolveAdminWriteOutcome'
import { PrivilegedActionFeedbackLayer } from '@/admin/governance/PrivilegedActionFeedbackLayer'
import { AdminGovernanceStatusBadge } from '@/admin/governance/AdminGovernanceStatusBadge'
import type { AdminRequestType } from '@/api/adminRequests'
import AdminServicerWalletPanel from '@/components/admin/ops/AdminServicerWalletPanel'
import AdminTransactionTypeBadge from '@/components/admin/transactions/AdminTransactionTypeBadge'
import {
  AdminListPagination,
  AdminPageFrame,
  AdminPanel,
  AdminSearchField,
  AdminSegmentedTabs,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusPill,
  AdminTableHeadRow,
  AdminTableShell,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminTabItem,
} from '@/components/admin/primitives'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { useListPageState } from '@/hooks/useListPageState'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useCancellableThunkDispatch } from '@/hooks/useCancellableThunkDispatch'
import {
  approveAdminRequest,
  clearAdminPayoutWithdrawalsActionError,
  clearAdminPayoutWithdrawalsApproveFeedback,
  dismissServicerGasWarning,
  refreshAdminPayoutWithdrawals,
  rejectAdminRequest,
} from '@/store/slices/adminPayoutWithdrawalsSlice'
import {
  formatPayoutWithdrawalCount,
  formatPayoutWithdrawalSummaryMoney,
  payoutWithdrawalStatusLabel,
  payoutWithdrawalStatusPillVariant,
} from '@/utils/mapAdminPayoutWithdrawalsList'
import { payoutWithdrawalsListCacheKey } from '@/utils/payoutWithdrawalsListCache'
import { getListPaginationMeta, listPaginationOffset } from '@/utils/listPagination'

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'] as const

type StatusTab = (typeof STATUS_TABS)[number]

const STATUS_TAB_ITEMS: AdminTabItem<StatusTab>[] = STATUS_TABS.map((t) => ({ value: t, label: t }))

const TABLE_HEADERS = ['ID', 'Type', 'Party', 'Amount', 'Date', 'Status', 'Action'] as const

const POLL_MS = 30_000

function statusTabToFilter(tab: StatusTab) {
  switch (tab) {
    case 'Pending':
      return 'pending' as const
    case 'Approved':
      return 'approved' as const
    case 'Rejected':
      return 'rejected' as const
    default:
      return 'all' as const
  }
}

const AdminPayoutWithdrawalManagementPage = () => {
  const dispatch = useAppDispatch()
  const { dispatchCancellable, cancelPending } = useCancellableThunkDispatch()
  const {
    counts,
    results,
    resultsCache,
    status,
    total,
    actionStatus,
    actionRequestKey,
    actionType,
    actionKind,
    actionError,
    lastApproveOutcome,
    servicerGasWarning,
  } = useAppSelector((s) => s.adminPayoutWithdrawals)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)

  const [statusTab, setStatusTab] = useState<StatusTab>('All')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [page, setPage] = useListPageState([statusTab, searchDebounced])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const apiStatusFilter = useMemo(() => statusTabToFilter(statusTab), [statusTab])
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

  const pageCacheKey = payoutWithdrawalsListCacheKey(pageQuery)
  const hasPageCache = Object.prototype.hasOwnProperty.call(resultsCache, pageCacheKey)

  const refreshPage = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshAdminPayoutWithdrawals({
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

  const hasGovernancePending = useMemo(
    () =>
      results.some(
        (r) =>
          r.pendingGovernanceProposalId ||
          r.governanceStatus === 'pending_signatures' ||
          r.governanceStatus === 'ready',
      ),
    [results],
  )

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin' || !hasGovernancePending) return
    const id = window.setInterval(() => refreshPage(true), POLL_MS)
    return () => window.clearInterval(id)
  }, [accessToken, sessionKind, hasGovernancePending, refreshPage])

  const summaryCards = useMemo(
    () => [
      { title: 'Pending', value: formatPayoutWithdrawalCount(counts.pending) },
      { title: 'Approved', value: formatPayoutWithdrawalCount(counts.approved) },
      { title: 'Rejected', value: formatPayoutWithdrawalCount(counts.rejected) },
      {
        title: 'Withdrawal Volume',
        value: formatPayoutWithdrawalSummaryMoney(counts.withdrawalVolume),
      },
    ],
    [counts],
  )

  const handleDecision = useCallback(
    (requestKey: string, type: AdminRequestType, partyWallet: string, decision: 'approve' | 'reject') => {
      if (decision === 'approve') {
        dispatchCancellable(
          approveAdminRequest({
            requestKey,
            type,
            userWallet: type === 'withdrawal' ? partyWallet : undefined,
          }),
        )
      } else {
        dispatchCancellable(rejectAdminRequest({ requestKey, type }))
      }
    },
    [dispatchCancellable],
  )

  const resolvedApproveOutcome = useMemo(
    () =>
      lastApproveOutcome
        ? resolveAdminWriteOutcome(lastApproveOutcome, { operationType: 'withdrawal_approve' })
        : null,
    [lastApproveOutcome],
  )

  const handleDismissActionFeedback = useCallback(() => {
    dispatch(clearAdminPayoutWithdrawalsActionError())
    dispatch(clearAdminPayoutWithdrawalsApproveFeedback())
  }, [dispatch])

  const handleRetryAction = useCallback(() => {
    const requestKey = actionRequestKey?.trim()
    if (!requestKey || !actionType || !actionKind) return
    if (actionKind === 'reject') {
      dispatchCancellable(rejectAdminRequest({ requestKey, type: actionType }))
      return
    }
    const row = results.find((r) => r.requestKey === requestKey)
    dispatchCancellable(
      approveAdminRequest({
        requestKey,
        type: actionType,
        userWallet: actionType === 'withdrawal' ? row?.party.wallet : undefined,
      }),
    )
  }, [dispatchCancellable, actionRequestKey, actionType, actionKind, results])

  const actionPhase =
    actionStatus === 'idle' ? ('idle' as const) : actionStatus

  const payoutActionLabels = useMemo(() => {
    const isReject =
      actionKind === 'reject' || (actionStatus === 'succeeded' && !lastApproveOutcome)
    return {
      loadingTitle: isReject ? 'Rejecting request' : 'Approving request',
      loadingDescription: isReject
        ? 'Submitting your rejection. This may take a moment…'
        : 'Submitting your approval. This may create a governance proposal…',
      errorTitle: isReject ? 'Unable to reject request' : 'Unable to approve request',
      directSuccessTitle: isReject ? 'Request rejected' : 'Request approved',
      directSuccessDescription: isReject
        ? 'The payout or withdrawal request was rejected successfully.'
        : resolvedApproveOutcome?.kind === 'direct_complete'
          ? resolvedApproveOutcome.message.trim() ||
            'The payout or withdrawal request was approved successfully.'
          : undefined,
    }
  }, [actionKind, actionStatus, lastApproveOutcome, resolvedApproveOutcome])

  function isRowGovernanceActive(row: (typeof results)[number]): boolean {
    return Boolean(
      row.pendingGovernanceProposalId ||
        row.governanceStatus === 'pending_signatures' ||
        row.governanceStatus === 'ready',
    )
  }

  const tableLoading = status === 'loading' && results.length === 0 && !hasPageCache
  const emptyMessage = searchDebounced
    ? 'No payout or withdrawal requests match your search.'
    : statusTab !== 'All'
      ? 'No requests in this filter yet.'
      : 'There are no requests at the moment.'

  return (
    <AdminPageFrame>
      <PrivilegedActionFeedbackLayer
        phase={actionPhase}
        resolvedOutcome={
          actionStatus === 'succeeded' && resolvedApproveOutcome ? resolvedApproveOutcome : null
        }
        loadingTitle={payoutActionLabels.loadingTitle}
        loadingDescription={payoutActionLabels.loadingDescription}
        errorTitle={payoutActionLabels.errorTitle}
        errorDescription={actionError ?? undefined}
        directSuccessTitle={payoutActionLabels.directSuccessTitle}
        directSuccessDescription={payoutActionLabels.directSuccessDescription}
        onDismiss={handleDismissActionFeedback}
        onRetry={handleRetryAction}
        onCancelLoading={cancelPending}
      />

      <AdminServicerWalletPanel />

      {servicerGasWarning ? (
        <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[#92400E] text-[14px]">{servicerGasWarning}</p>
          <button
            type="button"
            onClick={() => dispatch(dismissServicerGasWarning())}
            className="text-[#92400E] text-[13px] font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <AdminStatGrid>
        {summaryCards.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} />
        ))}
      </AdminStatGrid>

      <AdminPanel>
        <AdminToolbarRow
          start={<AdminSegmentedTabs items={STATUS_TAB_ITEMS} value={statusTab} onChange={setStatusTab} />}
          end={
            <AdminSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search transaction, party, or wallet"
              aria-label="Search payout and withdrawal requests"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1040px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading payout and withdrawal requests…
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              results.map((r, idx) => {
                const rowActionLoading =
                  actionStatus === 'loading' && actionRequestKey === r.requestKey
                const governanceActive = isRowGovernanceActive(r)
                const canReject = r.actions.canReject && !rowActionLoading && !governanceActive
                const canApprove = r.actions.canApprove && !rowActionLoading && !governanceActive
                return (
                  <tr key={r.requestKey} className={adminZebraRowClass(idx)}>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top font-mono">
                      {r.id}
                    </td>
                    <td className="px-5 py-5 align-top">
                      <AdminTransactionTypeBadge type={r.type} typeLabel={r.typeLabel} />
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">
                      {r.party.displayName}
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.amountDisplay}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.dateDisplay}</td>
                    <td className="px-5 py-5 align-top">
                      <div className="flex flex-col gap-2 items-start">
                        <AdminStatusPill variant={payoutWithdrawalStatusPillVariant(r.status, r)}>
                          {payoutWithdrawalStatusLabel(r.status, r)}
                        </AdminStatusPill>
                        <AdminGovernanceStatusBadge
                          proposalId={r.pendingGovernanceProposalId}
                          governanceStatus={r.governanceStatus}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-5 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="h-9 px-4 rounded-[4px] bg-[#DC2626] text-white text-[13px] font-semibold hover:bg-[#b91c1c] transition-colors disabled:opacity-40 disabled:hover:bg-[#DC2626] disabled:cursor-not-allowed"
                          disabled={!canReject}
                          onClick={() => handleDecision(r.requestKey, r.type, r.party.wallet, 'reject')}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="h-9 px-4 rounded-[4px] bg-[#195EBC] text-white text-[13px] font-semibold hover:bg-[#154a9a] transition-colors disabled:opacity-40 disabled:hover:bg-[#195EBC] disabled:cursor-not-allowed"
                          disabled={!canApprove}
                          onClick={() => handleDecision(r.requestKey, r.type, r.party.wallet, 'approve')}
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </AdminTableShell>
        <AdminListPagination meta={meta} onPageChange={setPage} loading={status === 'loading'} />
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminPayoutWithdrawalManagementPage
