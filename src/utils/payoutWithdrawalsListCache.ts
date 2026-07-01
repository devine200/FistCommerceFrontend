import type {
  AdminRequestRow,
  AdminRequestStatusFilter,
  FetchAdminRequestsParams,
} from '@/api/adminRequests'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'

export const PAYOUT_WITHDRAWALS_FULL_LIST_FILTER = {
  status: 'all',
  type: 'all',
} as const satisfies FetchAdminRequestsParams

export function payoutWithdrawalsListCacheKey(filter: FetchAdminRequestsParams = {}): string {
  const status = filter.status ?? 'all'
  const type = filter.type ?? 'all'
  const search = filter.search?.trim() ?? ''
  const limit = filter.limit ?? DASHBOARD_LIST_PAGE_SIZE
  const offset = filter.offset ?? 0
  return `${status}|${type}|${search}|${limit}|${offset}`
}

export function filterPayoutWithdrawalsByStatus(
  rows: AdminRequestRow[],
  status: AdminRequestStatusFilter,
): AdminRequestRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

export function filterPayoutWithdrawalsBySearch(
  rows: AdminRequestRow[],
  query: string,
): AdminRequestRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const hay = [
      row.id,
      row.requestKey,
      row.party.displayName,
      row.party.wallet,
      row.typeLabel,
      row.amountDisplay,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function payoutWithdrawalListsEqual(a: AdminRequestRow[], b: AdminRequestRow[]): boolean {
  if (a.length !== b.length) return false
  return a.every((row, index) => {
    const other = b[index]
    if (!other) return false
    return (
      row.requestKey === other.requestKey &&
      row.status === other.status &&
      row.governanceStatus === other.governanceStatus &&
      row.pendingGovernanceProposalId === other.pendingGovernanceProposalId &&
      row.actions.canApprove === other.actions.canApprove &&
      row.actions.canReject === other.actions.canReject
    )
  })
}
