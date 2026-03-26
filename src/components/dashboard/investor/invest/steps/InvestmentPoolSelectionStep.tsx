import type { InvestmentPoolInfo } from '@/components/dashboard/investor/invest/types'

interface InvestmentPoolSelectionStepProps {
  displayAmount: number
  pool: InvestmentPoolInfo
  detailsLabel: string
  onContinue: () => void
}

const InvestmentPoolSelectionStep = ({
  displayAmount,
  pool,
  detailsLabel,
  onContinue,
}: InvestmentPoolSelectionStepProps) => {
  return (
    <>
      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-5 sm:p-6">
        <h2 className="text-[#0B1220] font-bold text-[30px] leading-tight">Select Lending Pool</h2>
        <p className="text-[#6B7488] text-[14px] mt-1.5">
          Choose which pool to deploy your ${displayAmount.toLocaleString()} USDT into
        </p>

        <button type="button" className="mt-5 w-full rounded-[10px] border border-[#3B82F6] bg-[#F7FAFF] px-6 py-5 text-left">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#0B1220] flex items-center justify-center text-[20px]">
              &lt;/&gt;
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[#0B1220] font-bold text-[26px] leading-tight">{pool.name}</p>
                {pool.recommended ? (
                  <span className="inline-flex items-center rounded-full bg-[#DCFCE7] text-[#16A34A] text-[12px] px-2 py-0.5 font-semibold">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="text-[#6B7488] text-[14px] mt-1">TVL: {pool.tvl}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[#8B92A3] text-[12px]">APY</p>
              <p className="text-[#16A34A] text-[28px] font-semibold leading-tight">{pool.apy}</p>
            </div>
            <span className="h-6 w-6 rounded-full border-2 border-[#195EBC] text-[#195EBC] text-[12px] flex items-center justify-center shrink-0">
              ⦿
            </span>
          </div>
        </button>
      </section>

      <section className="rounded-[10px] border border-[#D9DEE8] bg-white px-5 py-4">
        <button type="button" className="w-full flex items-center justify-between text-left text-[#6B7488] text-[14px]">
          <span className="inline-flex items-center gap-2">
            <span className="text-[#8B92A3]">○</span>
            {detailsLabel}
          </span>
          <span className="text-[#8B92A3]">⌄</span>
        </button>
      </section>

      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-5 sm:p-6">
        <p className="text-[#0B1220] text-[30px] font-bold leading-tight">
          Investing ${displayAmount.toLocaleString()} into {pool.name}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors"
        >
          Continue
        </button>
      </section>
    </>
  )
}

export default InvestmentPoolSelectionStep
