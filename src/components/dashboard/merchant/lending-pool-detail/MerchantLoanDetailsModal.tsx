import { useEffect } from 'react'

import type { MerchantLoanDetailExtended } from '@/components/dashboard/merchant/lending-pool-detail/types'

interface MerchantLoanDetailsModalProps {
  loan: MerchantLoanDetailExtended | null
  onClose: () => void
}

const MerchantLoanDetailsModal = ({ loan, onClose }: MerchantLoanDetailsModalProps) => {
  useEffect(() => {
    if (!loan) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loan, onClose])

  if (!loan) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-detail-title"
    >
      <div className="w-full max-w-[520px] bg-white rounded-[8px] border border-[#E6E8EC] shadow-lg p-8">
        <h2 id="loan-detail-title" className="text-[#0B1220] font-bold text-[24px]">
          Loan details
        </h2>
        <p className="text-[#6B7488] text-[16px] mt-1">{loan.merchantName}</p>

        <dl className="mt-6 flex flex-col gap-3 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#ACACAC]">Wallet</dt>
            <dd className="text-[#0B1220] font-medium text-right">{loan.walletShort}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#ACACAC]">Loan amount</dt>
            <dd className="text-[#0B1220] font-medium">{loan.loanAmount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#ACACAC]">Issue date</dt>
            <dd className="text-[#0B1220] font-medium">{loan.issueDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#ACACAC]">Repayment due</dt>
            <dd className="text-[#0B1220] font-medium">{loan.repaymentDue}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#ACACAC]">Repayment amount</dt>
            <dd className="text-[#0B1220] font-medium text-right">
              {loan.repaymentAmount}
              {loan.repaymentApy ? (
                <span className="block text-[#195EBC] text-[13px] font-semibold mt-0.5">{loan.repaymentApy}</span>
              ) : null}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#ACACAC]">Debt status</dt>
            <dd className="text-[#0B1220] font-medium">{loan.debtStatus}</dd>
          </div>
          {loan.purpose && (
            <div className="flex justify-between gap-4">
              <dt className="text-[#ACACAC]">Purpose</dt>
              <dd className="text-[#0B1220] font-medium text-right">{loan.purpose}</dd>
            </div>
          )}
          {loan.collateral && (
            <div className="flex justify-between gap-4">
              <dt className="text-[#ACACAC]">Collateral</dt>
              <dd className="text-[#0B1220] font-medium text-right">{loan.collateral}</dd>
            </div>
          )}
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full bg-[#195EBC] text-white font-semibold text-[16px] py-3 rounded-[6px]"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default MerchantLoanDetailsModal
