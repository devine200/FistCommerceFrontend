import { Link } from 'react-router-dom'

import PoolMetricsGrid from '@/components/dashboard/investor/lending-pool-detail/PoolMetricsGrid'
import type { PoolStatItem } from '@/components/dashboard/investor/lending-pool-detail/types'
import { POOL_SECTION_TITLE } from '@/components/dashboard/shared/poolDetailTypography'

interface InvestorMyStatsSectionProps {
  stats: PoolStatItem[]
  investTo?: string
  withdrawTo?: string
}

const InvestorMyStatsSection = ({ stats, investTo, withdrawTo }: InvestorMyStatsSectionProps) => {
  return (
    <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className={POOL_SECTION_TITLE}>My Stats</h2>
        <button type="button" className="text-[#195EBC] text-[16px] font-medium hover:underline self-start sm:self-auto">
          Report an issue
        </button>
      </div>
      <PoolMetricsGrid stats={stats} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {investTo ? (
          <Link
            to={investTo}
            className="bg-[#195EBC] text-white font-semibold text-[16px] sm:text-[18px] lg:text-[24px] py-3 lg:py-4 rounded-[8px] w-full hover:bg-[#154a9a] transition-colors text-center"
          >
            Invest
          </Link>
        ) : (
          <button
            type="button"
            className="bg-[#195EBC] text-white font-semibold text-[16px] sm:text-[18px] lg:text-[24px] py-3 lg:py-4 rounded-[8px] w-full hover:bg-[#154a9a] transition-colors"
          >
            Invest
          </button>
        )}
        {withdrawTo ? (
          <Link
            to={withdrawTo}
            className="bg-[#E8EFFB] text-[#195EBC] font-semibold text-[16px] sm:text-[18px] lg:text-[24px] py-3 lg:py-4 rounded-[8px] w-full border border-[#CFE0FF] hover:bg-[#DCE8FC] transition-colors text-center"
          >
            Withdraw
          </Link>
        ) : (
          <button
            type="button"
            className="bg-[#E8EFFB] text-[#195EBC] font-semibold text-[16px] sm:text-[18px] lg:text-[24px] py-3 lg:py-4 rounded-[8px] w-full border border-[#CFE0FF] hover:bg-[#DCE8FC] transition-colors"
          >
            Withdraw
          </button>
        )}
      </div>
    </section>
  )
}

export default InvestorMyStatsSection
