import LendingPoolOpportunityCard from '@/components/dashboard/LendingPoolOpportunityCard'
import { useNavigate } from 'react-router-dom'

const InfoCircleIcon = () => (
  <button
    type="button"
    aria-label="More information about Purchase Order Financing"
    className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#195EBC] text-[#195EBC] text-[12px] font-bold leading-none hover:bg-[#E8EFFB]"
  >
    i
  </button>
)

interface MerchantLendingPoolProps {
  /** e.g. "538,500" — format as needed from API */
  totalDepositsDisplay?: string
}

const MerchantLendingPool = ({ totalDepositsDisplay = '538,500' }: MerchantLendingPoolProps) => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[#0B1220] font-bold text-[28px] leading-tight">Purchase Order Financing</h2>
          <InfoCircleIcon />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
          <div className="flex items-center gap-2 rounded-full border border-[#E6E8EC] bg-white px-4 py-2 shadow-sm shrink-0">
            <span className="text-[#ACACAC] text-[18px] font-medium" aria-hidden>
              $
            </span>
            <span className="text-[#0B1220] text-[16px] font-bold">
              Total Deposits: {totalDepositsDisplay}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard/merchant/receivables')}
            className="h-[42px] sm:h-[40px] px-4 rounded-[6px] bg-[#195EBC] text-white text-[14px] font-medium hover:bg-[#154a9a] transition-colors"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="rounded-[6px] border border-[#DFE2E8] bg-white p-4 flex flex-col gap-4">
        <h3 className="text-black font-bold text-[20px]">All Lending Pools</h3>
        <LendingPoolOpportunityCard
          viewDetailsTo="/dashboard/merchant/lending-pool/fist-commerce-lending-pool"
          poolTitle="Fist Commerce Lending Pool"
        />
      </div>
    </section>
  )
}

export default MerchantLendingPool
