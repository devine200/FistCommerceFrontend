import type { WithdrawalReviewRow } from '@/components/dashboard/investor/withdraw/types'

interface WithdrawMethodConfirmationStepProps {
  amount: number
  poolName: string
  processingTime: string
  reviewRows: WithdrawalReviewRow[]
  warningText: string
  onContinue: () => void
}

const valueToneClass = (tone?: WithdrawalReviewRow['valueTone']) => {
  if (tone === 'primary') return 'text-[#195EBC] font-semibold'
  return 'text-[#0B1220]'
}

const WithdrawMethodConfirmationStep = ({
  amount,
  poolName,
  processingTime,
  reviewRows,
  warningText,
  onContinue,
}: WithdrawMethodConfirmationStepProps) => {
  return (
    <>
      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-6 sm:p-8">
        <h2 className="text-[#0B1220] font-bold text-[30px] leading-tight">Review Withdrawal Request</h2>
        <p className="text-[#6B7488] text-[14px] mt-1.5">Please review all details before confirming.</p>

        <div className="mt-4 rounded-[8px] overflow-hidden border border-[#2A6CC8]">
          <div className="bg-linear-to-r from-[#2A6CC8] to-[#73A4E7] px-5 py-5 sm:px-6 sm:py-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-white/80 text-[10px]">You are withdrawing</p>
              <p className="text-white font-bold text-[40px] leading-none mt-1">${amount.toLocaleString()}</p>
              <p className="text-white/90 text-[14px] mt-1">USDT from {poolName}</p>
            </div>
            <div className="rounded-[8px] bg-white/15 border border-white/20 px-5 py-4 text-right shrink-0 min-w-[160px]">
              <p className="text-white/80 text-[10px]">You'll receive</p>
              <p className="text-white font-bold text-[35px] leading-none mt-1">${amount.toLocaleString()}</p>
              <p className="text-white/80 text-[10px] mt-1">{processingTime} processing</p>
            </div>
          </div>

          <div className="divide-y divide-[#E8ECF3] border-x border-b border-[#E8ECF3]">
            {reviewRows.map((item) => (
              <div key={item.label} className="px-5 py-4 flex items-center justify-between gap-4">
                <span className="text-[#6B7488] text-[14px]">{item.label}</span>
                <span className={`text-[14px] text-right ${valueToneClass(item.valueTone)}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="border-x border-b border-[#E8ECF3] rounded-b-[8px] px-5 py-4">
            <div className="rounded-[6px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex items-center gap-2.5">
              <span className="text-[#DC2626] text-[14px]">△</span>
              <p className="text-[#DC2626] text-[12px] sm:text-[13px] leading-tight">{warningText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-4 sm:p-5">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors"
        >
          Continue
        </button>
      </section>
    </>
  )
}

export default WithdrawMethodConfirmationStep
