import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export type AlertModalDetail =
  | {
      kind: 'loan-default'
      receivableId: string
      subtitle: string
      merchantName: string
      receivableName: string
      invoiceAmount: string
      statusLine: string
    }
  | {
      kind: 'late-repayment'
      receivableId: string
      subtitle: string
      merchantName: string
      receivableName: string
      invoiceAmount: string
      statusLine: string
    }
  | {
      kind: 'large-withdrawal'
      subtitle: string
      investorName: string
      walletAddress: string
      withdrawalAmount: string
      statusLine: string
    }

    
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

function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-4 flex items-center gap-1 text-[#6B7488] text-[14px] hover:text-[#0B1220]"
      aria-label="Back to alerts"
    >
      <span className="text-[18px] leading-none" aria-hidden>
        ←
      </span>
    </button>
  )
}

function DetailRows({ rows }: { rows: { label: string; value: string; valueClassName?: string }[] }) {
  return (
    <dl className="flex flex-col divide-y divide-[#E6E8EC] border-t border-b border-[#E6E8EC]">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4 py-3 text-[14px]">
          <dt className="text-[#6B7488] shrink-0">{r.label}</dt>
          <dd className={['text-[#0B1220] font-medium text-right', r.valueClassName ?? ''].join(' ')}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AdminLoanDefaultModal({ detail, onClose }: { detail: Extract<AlertModalDetail, { kind: 'loan-default' }>; onClose: () => void }) {
  useModalEscape(onClose, true)
  return (
    <div
      className={overlayClass}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-loan-default-title"
    >
      <div className="w-full max-w-[480px] bg-white rounded-[12px] border-2 border-[#EF4444] shadow-xl p-6 sm:p-8">
        <BackRow onBack={onClose} />
        <h2 id="alert-loan-default-title" className="text-[#0B1220] font-semibold text-[20px] leading-tight">
          Loan Default Detected
        </h2>
        <p className="text-[#0B1220] text-[14px] mt-2 leading-snug">{detail.subtitle}</p>
        <div className="mt-6">
          <DetailRows
            rows={[
              { label: 'Merchant Name', value: detail.merchantName },
              { label: 'Receivable Name', value: detail.receivableName },
              { label: 'Invoice Amount', value: detail.invoiceAmount },
              { label: 'Status', value: detail.statusLine, valueClassName: 'text-[#EF4444] font-semibold' },
            ]}
          />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="min-h-[44px] rounded-[8px] bg-[#9CA3AF] text-white text-[14px] font-medium hover:bg-[#878f9a]"
            >
              Contact Merchant (Email)
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-[8px] bg-[#DC2626] text-white text-[14px] font-medium hover:bg-[#B91C1C]"
            >
              Suspend Merchant
            </button>
          </div>
          <Link
            to={`/dashboard/admin/receivables/${detail.receivableId}`}
            onClick={onClose}
            className="min-h-[48px] rounded-[8px] bg-[#195EBC] text-white text-[15px] font-medium flex items-center justify-center hover:bg-[#154a96]"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AdminLateRepaymentModal({ detail, onClose }: { detail: Extract<AlertModalDetail, { kind: 'late-repayment' }>; onClose: () => void }) {
  useModalEscape(onClose, true)
  return (
    <div
      className={overlayClass}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-late-title"
    >
      <div className="w-full max-w-[480px] bg-white rounded-[12px] border-2 border-[#F97316] shadow-xl p-6 sm:p-8">
        <BackRow onBack={onClose} />
        <h2 id="alert-late-title" className="text-[#0B1220] font-semibold text-[20px] leading-tight">
          Late Repayment Detected
        </h2>
        <p className="text-[#0B1220] text-[14px] mt-2 leading-snug">{detail.subtitle}</p>
        <div className="mt-6">
          <DetailRows
            rows={[
              { label: 'Merchant Name', value: detail.merchantName },
              { label: 'Receivable Name', value: detail.receivableName },
              { label: 'Invoice Amount', value: detail.invoiceAmount },
              { label: 'Status', value: detail.statusLine, valueClassName: 'text-[#F97316] font-semibold' },
            ]}
          />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="min-h-[44px] rounded-[8px] bg-[#9CA3AF] text-white text-[14px] font-medium hover:bg-[#878f9a]"
            >
              Contact Merchant (Email)
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-[8px] bg-[#F97316] text-white text-[14px] font-medium hover:bg-[#EA580C]"
            >
              Send Reminder
            </button>
          </div>
          <Link
            to={`/dashboard/admin/receivables/${detail.receivableId}`}
            onClick={onClose}
            className="min-h-[48px] rounded-[8px] bg-[#195EBC] text-white text-[15px] font-medium flex items-center justify-center hover:bg-[#154a96]"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AdminLargeWithdrawalModal({ detail, onClose }: { detail: Extract<AlertModalDetail, { kind: 'large-withdrawal' }>; onClose: () => void }) {
  useModalEscape(onClose, true)
  const statusOrange = detail.statusLine.toLowerCase().includes('pending')
  return (
    <div
      className={overlayClass}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-withdrawal-title"
    >
      <div className="w-full max-w-[480px] bg-white rounded-[12px] border-2 border-[#195EBC] shadow-xl p-6 sm:p-8">
        <BackRow onBack={onClose} />
        <h2 id="alert-withdrawal-title" className="text-[#0B1220] font-semibold text-[20px] leading-tight">
          Large Withdrawal Detected
        </h2>
        <p className="text-[#0B1220] text-[14px] mt-2 leading-snug">{detail.subtitle}</p>
        <div className="mt-6">
          <DetailRows
            rows={[
              { label: 'Investor Name', value: detail.investorName },
              { label: 'Wallet Address', value: detail.walletAddress },
              { label: 'Withdrawal Amount', value: detail.withdrawalAmount },
              {
                label: 'Status',
                value: detail.statusLine,
                valueClassName: statusOrange ? 'text-[#F97316] font-semibold' : 'text-[#0B1220] font-medium',
              },
            ]}
          />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="min-h-[44px] rounded-[8px] bg-[#9CA3AF] text-white text-[14px] font-medium hover:bg-[#878f9a]"
            >
              Contact Investor (Email)
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-[8px] bg-[#DC2626] text-white text-[14px] font-medium hover:bg-[#B91C1C]"
            >
              Freeze Account
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] rounded-[8px] bg-[#195EBC] text-white text-[15px] font-medium flex items-center justify-center hover:bg-[#154a96]"
          >
            Approve Withdrawal
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminAlertModalRouter({ detail, onClose }: { detail: AlertModalDetail | null; onClose: () => void }) {
  if (!detail) return null
  if (detail.kind === 'loan-default') return <AdminLoanDefaultModal detail={detail} onClose={onClose} />
  if (detail.kind === 'late-repayment') return <AdminLateRepaymentModal detail={detail} onClose={onClose} />
  return <AdminLargeWithdrawalModal detail={detail} onClose={onClose} />
}
