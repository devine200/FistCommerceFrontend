import type { MerchantRepayReviewBreakdown } from '@/utils/mapLoanDetailsToRepayReviewView'
import {
  MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE,
  MERCHANT_REPAY_WARNING,
} from '@/components/dashboard/merchant/repay/repayFlowConfig'

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EDF0F4]">
      <span className="text-[#6B7488] text-[12px]">{label}</span>
      <span className="text-[#0B1220] text-[12px] font-medium">{value}</span>
    </div>
  )
}

function ReviewKeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EDF0F4]">
      <span className="text-[#6B7488] text-[12px]">{label}</span>
      <span className="text-[#0B1220] text-[12px] font-medium text-right">{value}</span>
    </div>
  )
}

export type MerchantRepayReviewPanelProps = {
  receivableName: string
  paymentDisplay: string
  review: MerchantRepayReviewBreakdown
  connectedWallet: string
  canRepayOnChain: boolean
  statusMessage: string | null
  submitError: string | null
  buttonLabel: string
  submitDisabled: boolean
  onSubmit: () => void
}

const MerchantRepayReviewPanel = ({
  receivableName,
  paymentDisplay,
  review,
  connectedWallet,
  canRepayOnChain,
  statusMessage,
  submitError,
  buttonLabel,
  submitDisabled,
  onSubmit,
}: MerchantRepayReviewPanelProps) => (
  <section className="rounded-[10px] border border-[#DFE2E8] bg-white flex flex-col overflow-hidden">
    <div className="bg-linear-to-r from-[#2A6CC8] to-[#73A4E7] px-6 py-5 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-white font-semibold text-[16px] truncate">{receivableName}</p>
        <p className="text-white/90 text-[12px] mt-1">{review.subtitle}</p>
      </div>
      <div className="rounded-[8px] bg-white/15 border border-white/20 px-4 py-3 min-w-[180px] text-right shrink-0">
        <p className="text-white/80 text-[10px]">Payment amount</p>
        <p className="text-white font-bold text-[28px] leading-none mt-1">${paymentDisplay}</p>
        <p className="text-white/80 text-[10px] mt-2">{review.aprLabel}</p>
      </div>
    </div>

    <div className="px-6 py-2 flex-1">
      <ReviewRow label="Principal Due" value={review.principalDue} />
      <ReviewRow label="Interest Due" value={review.interestDue} />
      <ReviewRow label="Late Fees (if any)" value={review.lateFeesDue} />
      {review.platformFee ? <ReviewKeyValue label="Platform fee" value={review.platformFee} /> : null}
      <ReviewKeyValue label="Total owed" value={review.totalOwed} />
      <ReviewKeyValue label="Connected Wallet Address" value={connectedWallet} />
      <ReviewKeyValue label="Lending Pool" value={review.lendingPoolName} />

      <div className="mt-4 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex items-start gap-3">
        <span className="text-[#F59E0B] text-[14px] leading-none" aria-hidden>
          ⚠
        </span>
        <p className="text-[#DC2626] text-[12px] leading-relaxed">{MERCHANT_REPAY_WARNING}</p>
      </div>

      {!canRepayOnChain ? (
        <p className="mt-3 text-[#DC2626] text-[12px]" role="alert">
          {MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="mt-3 text-[#4D5D80] text-[12px] leading-relaxed" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}

      {submitError ? (
        <p className="mt-3 text-[#DC2626] text-[12px]" role="alert">
          {submitError}
        </p>
      ) : null}
    </div>

    <div className="mt-auto px-6 py-4 border-t border-[#EDF0F4] bg-white">
      <button
        type="button"
        className="w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={submitDisabled}
        onClick={onSubmit}
      >
        {buttonLabel}
      </button>
    </div>
  </section>
)

export default MerchantRepayReviewPanel
