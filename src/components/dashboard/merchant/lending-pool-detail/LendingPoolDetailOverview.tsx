import LendingPoolDetailInfoPanel from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailInfoPanel'

const DEFAULT_PARAGRAPHS = [
  'This lending pool allocates capital to qualified merchants against verified purchase orders and short-term working capital needs. Each facility is sized to the underlying trade flow, with documentation reviewed before drawdown and disbursement tracked on-chain where applicable.',
  'Risk is managed through diversification across merchants and sectors, concentration limits per borrower, and ongoing monitoring of repayment behavior. Collateral or guarantees may be required depending on program tier and history with the platform.',
  'Liquidity for investors is supported by scheduled repayments and defined maturities. Pool parameters—including target duration, yield bands, and utilization targets—are published here and may be updated as market conditions change.',
  'Before participating, review the terms for loan section and your own risk tolerance. Past performance does not guarantee future results; principal is at risk. For questions, contact support or review the pool prospectus in the documents area.',
]

interface LendingPoolDetailOverviewProps {
  overviewParagraphs?: string[]
  financialInfoRows: { label: string; value: string }[]
  termsForLoanRows: { label: string; value: string }[]
}

const LendingPoolDetailOverview = ({
  overviewParagraphs = DEFAULT_PARAGRAPHS,
  financialInfoRows,
  termsForLoanRows,
}: LendingPoolDetailOverviewProps) => {
  return (
    <section className="rounded-[12px] border border-[#DFE2E8] bg-white p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 shadow-sm">
      <div>
        <h2 className="text-[#0B1220] font-bold text-[18px] sm:text-[20px] lg:text-[22px] mb-4 lg:mb-5">Overview</h2>
        <div className="flex flex-col gap-3 sm:gap-4 text-[#3A4356] text-[13px] sm:text-[14px] lg:text-[15px] leading-[1.65] text-justify">
          {overviewParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        <LendingPoolDetailInfoPanel title="Financial Information" rows={financialInfoRows} />
        <LendingPoolDetailInfoPanel title="Terms for Loan" rows={termsForLoanRows} />
      </div>
    </section>
  )
}

export default LendingPoolDetailOverview
