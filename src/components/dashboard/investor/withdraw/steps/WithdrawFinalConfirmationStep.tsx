interface WithdrawFinalConfirmationStepProps {
  /** Formatted USD string (includes `$` and grouping). */
  amountDisplay: string
  destinationWallet: string
  processingTime: string
  /** On-chain native gas estimate (e.g. from `estimateContractGas` + fee data). */
  estimatedNetworkFeeLabel?: string
  isSubmitting?: boolean
  onConfirm: () => void | Promise<void>
}

const WithdrawFinalConfirmationStep = ({
  amountDisplay,
  destinationWallet,
  processingTime,
  estimatedNetworkFeeLabel,
  isSubmitting = false,
  onConfirm,
}: WithdrawFinalConfirmationStepProps) => {
  return (
    <>
      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-6 sm:p-8">
        <h2 className="text-[#0B1220] font-bold text-[30px] leading-tight">Withdrawal Confirmation</h2>
        <p className="text-[#6B7488] text-[14px] mt-1.5">Your withdrawal request is ready to be submitted.</p>

        <div className="mt-5 rounded-[10px] border border-[#E6E8EC] bg-[#F8FAFC] p-5">
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-[#6B7488] text-[14px]">Amount</span>
            <span className="text-[#0B1220] font-semibold text-[16px]">{amountDisplay}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2 border-t border-[#E6E8EC]">
            <span className="text-[#6B7488] text-[14px]">Destination</span>
            <span className="text-[#0B1220] font-semibold text-[14px]">{destinationWallet}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2 border-t border-[#E6E8EC]">
            <span className="text-[#6B7488] text-[14px]">Expected processing</span>
            <span className="text-[#195EBC] font-semibold text-[14px]">{processingTime}</span>
          </div>
          {estimatedNetworkFeeLabel ? (
            <div className="flex items-center justify-between gap-4 py-2 border-t border-[#E6E8EC]">
              <span className="text-[#6B7488] text-[14px]">Gas fee (est.)</span>
              <span className="text-[#0B1220] font-semibold text-[14px]">{estimatedNetworkFeeLabel}</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-4 sm:p-5">
        <button
          type="button"
          onClick={() => void onConfirm()}
          disabled={isSubmitting}
          className="w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Confirm in wallet…' : 'Withdraw Funds'}
        </button>
      </section>
    </>
  )
}

export default WithdrawFinalConfirmationStep
