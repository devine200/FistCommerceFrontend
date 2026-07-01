import type {
  AdminTransactionModalPayload,
  AdminTransactionTabFilter,
} from '@/api/adminTransactions'
import { displayDashboardCompactUsd } from '@/api/metrics'
import type {
  AdminTransactionDetail,
  AdminTxModalStatus,
} from '@/components/admin/transactions/types'

export function formatAdminTransactionsSummaryMoney(amount: string): string {
  return displayDashboardCompactUsd(amount)
}

export function tabToAdminTransactionStatusFilter(tab: string): AdminTransactionTabFilter {
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

function normalizeModalStatus(raw: string): AdminTxModalStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'pending') return 'Pending'
  if (t === 'under_review' || t === 'under review') return 'Under Review'
  if (t === 'approved') return 'Approved'
  if (t === 'rejected') return 'Rejected'
  const label = raw.trim()
  if (
    label === 'Pending' ||
    label === 'Under Review' ||
    label === 'Approved' ||
    label === 'Rejected'
  ) {
    return label
  }
  return 'Pending'
}

export function mapAdminTransactionModalToDetail(
  modal: AdminTransactionModalPayload,
): AdminTransactionDetail {
  return {
    summaryLabel: modal.summaryLabel,
    amountDisplay: modal.amountDisplay,
    flow: modal.flow,
    partyLabel: modal.partyLabel,
    partyName: modal.partyName,
    transactionId: modal.transactionId,
    dateTime: modal.dateTime,
    transactionType: modal.transactionType,
    status: normalizeModalStatus(modal.status),
    transactionAmount: modal.transactionAmount,
    feesDeducted: modal.feesDeducted,
    netReceived: modal.netReceived,
    walletAddress: modal.walletAddress,
    walletAddressFull: modal.walletAddressFull,
    network: modal.network,
    transactionHash: modal.transactionHash,
  }
}

/** Split detail text on wallet addresses and dollar amounts for highlight styling. */
const DETAIL_HIGHLIGHT_PATTERN = /(\$[\d,]+(?:\.\d+)?|0x[a-fA-F0-9]+(?:\.\.\.[a-fA-F0-9]+)?)/g

export type AdminTransactionDetailSegment = {
  text: string
  highlight: boolean
}

export function splitAdminTransactionDetailText(detail: string): AdminTransactionDetailSegment[] {
  const text = detail.trim() || '—'
  const segments: AdminTransactionDetailSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const re = new RegExp(DETAIL_HIGHLIGHT_PATTERN.source, 'g')
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), highlight: false })
    }
    segments.push({ text: match[0], highlight: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false })
  }

  return segments.length ? segments : [{ text, highlight: false }]
}
