import { useEffect } from 'react'

import type {
  AdminTransactionDetailRow,
  AdminTransactionDetailsModalProps,
  AdminTransactionFlowIconProps,
  AdminTransactionModalDetailRowsProps,
  AdminTxModalStatus,
} from './types'

export type { AdminTransactionDetail, AdminTxModalStatus } from './types'

const overlayClass =
  'fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5'

function useModalEscape(onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

function statusValueClass(status: AdminTxModalStatus) {
  switch (status) {
    case 'Pending':
      return 'text-[#D97706] font-semibold'
    case 'Under Review':
      return 'text-[#A855F7] font-semibold'
    case 'Approved':
      return 'text-[#16A34A] font-semibold'
    case 'Rejected':
      return 'text-[#DC2626] font-semibold'
    default:
      return 'text-[#0B1220] font-medium'
  }
}

function FlowIcon({ flow }: AdminTransactionFlowIconProps) {
  if (flow === 'out') {
    return (
      <div
        className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#DC2626]"
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M17 7H9M17 7v8" />
        </svg>
      </div>
    )
  }
  if (flow === 'in') {
    return (
      <div
        className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 text-[#16A34A]"
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 7 10 10M7 17V9M7 17h8" />
        </svg>
      </div>
    )
  }
  return (
    <div
      className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 text-[#6B7280]"
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 7l-5-5-5 5" />
      </svg>
    </div>
  )
}

function DetailRows({ detail }: AdminTransactionModalDetailRowsProps) {
  const rows: AdminTransactionDetailRow[] = [
    { label: detail.partyLabel, value: detail.partyName },
    { label: 'Transaction ID', value: detail.transactionId },
    { label: 'Date & Time', value: detail.dateTime },
    { label: 'Transaction Type', value: detail.transactionType },
    { label: 'Status', value: detail.status, valueClassName: statusValueClass(detail.status) },
    { label: 'Transaction Amount', value: detail.transactionAmount },
    { label: 'Fees Deducted', value: detail.feesDeducted },
    { label: 'Net Received', value: detail.netReceived },
    { label: 'Wallet Address', value: detail.walletAddress, valueClassName: 'text-[#195EBC] font-medium' },
    { label: 'Network', value: detail.network },
  ]

  return (
    <dl className="flex flex-col divide-y divide-[#E6E8EC] border-t border-b border-[#E6E8EC]">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4 py-3 text-[14px]">
          <dt className="text-[#6B7488] shrink-0">{r.label}</dt>
          <dd className={['text-[#0B1220] font-medium text-right break-all', r.valueClassName ?? ''].join(' ')}>
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const AdminTransactionDetailsModal = ({ detail, onClose }: AdminTransactionDetailsModalProps) => {
  useModalEscape(onClose, Boolean(detail))
  if (!detail) return null

  return (
    <div
      className={overlayClass}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-detail-title"
    >
      <div className="w-full max-w-[480px] bg-white rounded-[12px] shadow-xl border border-[#E6E8EC] p-6 sm:p-8">
        <h2 id="tx-detail-title" className="text-[#0B1220] font-semibold text-[20px] leading-tight">
          Transaction Details
        </h2>

        <div className="mt-6 flex items-start gap-4">
          <FlowIcon flow={detail.flow} />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[#6B7488] text-[14px] font-medium">{detail.summaryLabel}</p>
            <p className="text-[#0B1220] text-[28px] font-bold leading-tight mt-1">{detail.amountDisplay}</p>
          </div>
        </div>

        <div className="my-6 border-t border-[#E6E8EC]" />

        <DetailRows detail={detail} />

        <button
          type="button"
          className="mt-8 w-full min-h-[48px] rounded-[8px] bg-[#195EBC] text-white text-[15px] font-medium hover:bg-[#154a96]"
        >
          Report an Issue
        </button>
      </div>
    </div>
  )
}

export default AdminTransactionDetailsModal
