import LendingPoolOpportunityCard from '@/components/dashboard/LendingPoolOpportunityCard'
import DashboardBorderedPanel from '@/components/dashboard/shared/DashboardBorderedPanel'
import type { MerchantLendingPoolProps } from '@/components/dashboard/shared/types'
import { useAppSelector } from '@/store/hooks'

const InfoCircleIcon = () => (
  <button
    type="button"
    aria-label="More information about Purchase Order Financing"
    className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#195EBC] text-[#195EBC] text-[12px] font-bold leading-none hover:bg-[#E8EFFB]"
  >
    i
  </button>
)

const MerchantLendingPool = ({ totalDepositsDisplay: totalDepositsDisplayProp }: MerchantLendingPoolProps) => {
  const { totalDepositsDisplay: totalFromStore, lendingPools } = useAppSelector((s) => s.merchantDashboard)
  void (totalDepositsDisplayProp ?? totalFromStore)
  const pool = lendingPools
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[#0B1220] font-bold text-[28px] leading-tight">Purchase Order Financing</h2>
          <InfoCircleIcon />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
          {/* <div className="flex items-center gap-2 rounded-full border border-[#E6E8EC] bg-white px-4 py-2 shadow-sm shrink-0">
            <span className="text-[#ACACAC] text-[18px] font-medium" aria-hidden>
              $
            </span>
            <span className="text-[#0B1220] text-[16px] font-bold">Total Deposits: {totalDepositsDisplay}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard/merchant/receivables')}
            className="h-[42px] sm:h-[40px] px-4 rounded-[6px] bg-[#195EBC] text-white text-[14px] font-medium hover:bg-[#154a9a] transition-colors"
          >
            Withdraw Funds
          </button> */}
        </div>
      </div>

      <DashboardBorderedPanel title="All Lending Pools">
        <div className="flex flex-col gap-4">
          <LendingPoolOpportunityCard
            viewDetailsTo={pool.viewDetailsTo}
            poolTitle={pool.poolTitle}
            tagline={pool.tagline}
            apyDisplay={pool.apyDisplay}
            tvlDisplay={pool.tvlDisplay}
            minDepositDisplay={pool.minDepositDisplay}
            utilizationDisplay={pool.utilizationDisplay}
          />
        </div>
      </DashboardBorderedPanel>
    </section>
  )
}

export default MerchantLendingPool
