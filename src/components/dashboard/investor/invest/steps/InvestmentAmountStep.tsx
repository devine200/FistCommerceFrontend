import arbitrumLogo from '@/assets/arbitrum_icon.jpeg.png'
import { formatInvestAmountUsd } from '@/components/dashboard/investor/invest/config'

interface InvestmentAmountStepProps {
  amount: number
  walletDisplay: string
  quickAmounts: readonly number[]
  onAmountSelect: (value: number) => void
  onContinue: () => void
}

const InvestmentAmountStep = ({
  amount,
  walletDisplay,
  quickAmounts,
  onAmountSelect,
  onContinue,
}: InvestmentAmountStepProps) => {
  return (
    <section className="rounded-[10px] border border-[#D9DEE8] bg-white px-5 py-8 sm:px-6 sm:py-10">
      <p className="text-[#6B7488] text-[30px] text-center">Amount</p>
      <p className="text-[#667085] text-[64px] leading-none font-semibold text-center mt-4">
        {formatInvestAmountUsd(amount)}
      </p>

      <div className="flex justify-center flex-wrap gap-3 mt-8">
        {quickAmounts.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onAmountSelect(v)}
            className={`min-w-[90px] rounded-[4px] px-3 py-2 text-[13px] border ${
              amount === v ? 'border-[#195EBC] bg-[#E8EFFB] text-[#195EBC]' : 'border-[#E6E8EC] bg-[#F8FAFC] text-[#8B92A3]'
            }`}
          >
            ${v.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <div className="flex items-center gap-3">
          <span className="text-[#6B7488] text-[22px]">Wallet:</span>
          <div className="h-[46px] rounded-[6px] border border-[#D9DEE8] bg-white px-4 flex items-center gap-3">
            <span className="text-[#0B1220] text-[19px] font-semibold">{walletDisplay}</span>
            <span className="h-5 w-px bg-[#E6E8EC]" />
            <img src={arbitrumLogo} alt="Arbitrum logo" className="h-5 w-5 rounded-[4px] object-cover" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={amount <= 0}
        className="mt-10 w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </section>
  )
}

export default InvestmentAmountStep
