import { Link } from 'react-router-dom'

import investorPoolImage from '@/assets/investor_pool.png'

interface LendingPoolOpportunityCardProps {
  /** Merchant: navigate to loan detail route when set */
  viewDetailsTo?: string
  poolTitle?: string
}

/** Shared pool card used by investor and merchant lending pool sections. */
const LendingPoolOpportunityCard = ({
  viewDetailsTo,
  poolTitle = 'Fist Commerce Lending Pool',
}: LendingPoolOpportunityCardProps) => {
  const detailsLink = (
    <span className="text-[#195EBC] underline text-[20px] whitespace-nowrap pt-1">Click to view details</span>
  )

  return (
    <div className="bg-white border border-[#DFE2E8] rounded-[6px] p-4 flex items-stretch gap-6">
      <img
        src={investorPoolImage}
        alt="lending pool"
        className="h-full w-[300px] min-h-[200px] object-cover rounded-[3px]"
      />

      <div className="flex-1 flex flex-col justify-start">
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-[#0B1220] font-semibold text-[32px] leading-tight">{poolTitle}</h4>

          {viewDetailsTo ? (
            <Link to={viewDetailsTo} className="inline-flex items-start">
              {detailsLink}
            </Link>
          ) : (
            <span className="inline-flex items-start cursor-default">{detailsLink}</span>
          )}
        </div>

        <p className="text-[#3A4356] text-[20px] mt-2">For short-duration loans with stable returns.</p>

        <div className="mt-3 space-y-2 text-[20px]">
          <div className="flex items-center gap-2">
            <span className="text-[#ACACAC] font-normal">APY:</span>
            <span className="text-[#0B1220] font-medium">6-8% APY</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#ACACAC] font-normal">TVL:</span>
            <span className="text-[#0B1220] font-medium">538,500 USDC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#ACACAC] font-normal">Minimum Deposit:</span>
            <span className="text-[#0B1220] font-medium">100 USDC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#ACACAC] font-normal">Utilization:</span>
            <span className="text-[#0B1220] font-medium">60% Allocated</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LendingPoolOpportunityCard
