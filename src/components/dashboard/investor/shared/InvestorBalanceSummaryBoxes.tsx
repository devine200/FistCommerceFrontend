interface InvestorBalanceSummaryBoxesProps {
  walletBalanceDisplay: string
  investmentBalanceDisplay: string
  className?: string
}

const InvestorBalanceSummaryBoxes = ({
  walletBalanceDisplay,
  investmentBalanceDisplay,
  className,
}: InvestorBalanceSummaryBoxesProps) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className ?? ''}`}>
    <div className="rounded-[6px] border border-[#E6E8EC] bg-[#F9FAFB] px-4 py-3 text-left">
      <p className="text-[#8B92A3] text-[12px] sm:text-[14px]">Wallet balance</p>
      <p className="text-[#0B1220] text-[22px] sm:text-[26px] font-semibold leading-tight mt-1">
        {walletBalanceDisplay}
      </p>
      <p className="mt-1 text-[#8B92A3] text-[11px]">Mock ERC-20 token balance</p>
    </div>
    <div className="rounded-[6px] border border-[#195EBC] bg-[#E8EFFB] px-4 py-3 text-left">
      <p className="text-[#8B92A3] text-[12px] sm:text-[14px]">Investment balance</p>
      <p className="text-[#0B1220] text-[22px] sm:text-[26px] font-bold leading-tight mt-1">
        {investmentBalanceDisplay}
      </p>
      <p className="mt-1 text-[#8B92A3] text-[11px]">On-chain pool position</p>
    </div>
  </div>
)

export default InvestorBalanceSummaryBoxes
