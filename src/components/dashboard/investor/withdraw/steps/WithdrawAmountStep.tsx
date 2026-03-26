import arbitrumLogo from '@/assets/arbitrum_icon.jpeg.png'
import type { WithdrawalSourceCard } from '@/components/dashboard/investor/withdraw/types'

interface WithdrawAmountStepProps {
  amount: number
  destinationWallet: string
  sourceCards: WithdrawalSourceCard[]
  quickAmounts: readonly number[]
  onAmountSelect: (value: number) => void
  onContinue: () => void
}

const WithdrawAmountStep = ({
  amount,
  destinationWallet,
  sourceCards,
  quickAmounts,
  onAmountSelect,
  onContinue,
}: WithdrawAmountStepProps) => {
  const sourceCard = sourceCards[0]

  return (
    <>
      <section className="rounded-[10px] border border-[#D9DEE8] bg-white p-4 sm:p-6">
        <h2 className="text-[#6B7488] font-medium text-[16px] sm:text-[20px] mb-3 sm:mb-4">Withdraw Funds</h2>

        {sourceCard ? (
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-[6px] border border-[#195EBC] bg-[#E8EFFB] px-4 py-3 text-left">
              <p className="text-[#8B92A3] text-[12px] sm:text-[14px]">{sourceCard.label}</p>
              <p className="text-[#0B1220] text-[26px] sm:text-[34px] font-bold leading-tight mt-1">{sourceCard.value}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[10px] border border-[#D9DEE8] bg-white px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-[#6B7488] text-[14px] sm:text-[16px] text-center">Amount</p>
        <p className="text-[#667085] text-[44px] sm:text-[64px] leading-none font-semibold text-center mt-3 sm:mt-4">
          ${amount}
        </p>

        <div className="flex justify-center flex-wrap gap-3 mt-6 sm:mt-8">
          {quickAmounts.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onAmountSelect(v)}
              className={`min-w-[72px] sm:min-w-[90px] rounded-[4px] px-3 py-2 text-[13px] border ${
                amount === v ? 'border-[#195EBC] bg-[#E8EFFB] text-[#195EBC]' : 'border-[#E6E8EC] bg-[#F8FAFC] text-[#8B92A3]'
              }`}
            >
              ${v.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-6 sm:mt-10">
          <div className="flex items-center gap-3">
            <span className="text-[#6B7488] text-[14px] sm:text-[22px]">Wallet:</span>
            <div className="h-[40px] sm:h-[46px] rounded-[6px] border border-[#D9DEE8] bg-white px-3 sm:px-4 flex items-center gap-3">
              <span className="text-[#0B1220] text-[14px] sm:text-[19px] font-semibold">{destinationWallet}</span>
              <span className="h-5 w-px bg-[#E6E8EC]" />
              <img src={arbitrumLogo} alt="Arbitrum logo" className="h-5 w-5 rounded-[4px] object-cover" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 sm:mt-10 w-full rounded-[6px] bg-[#195EBC] text-white text-[16px] sm:text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors"
        >
          Continue
        </button>
      </section>
    </>
  )
}

export default WithdrawAmountStep
