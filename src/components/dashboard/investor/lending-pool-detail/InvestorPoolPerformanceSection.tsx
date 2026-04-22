import InvestorPoolPerformanceChart from '@/components/dashboard/investor/lending-pool-detail/InvestorPoolPerformanceChart'
import type { PoolStatItem } from '@/components/dashboard/investor/lending-pool-detail/types'
import { POOL_SECTION_TITLE } from '@/components/dashboard/shared/poolDetailTypography'

interface InvestorPoolPerformanceSectionProps {
  stats: PoolStatItem[]
}

const InvestorPoolPerformanceSection = ({ stats: _stats }: InvestorPoolPerformanceSectionProps) => {
  return (
    <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm min-w-0">
      <h2 className={POOL_SECTION_TITLE}>Pool Performance</h2>
      <div className="mt-6">
        {/* <PoolMetricsGrid stats={stats} /> */}
      </div>
      <InvestorPoolPerformanceChart />
    </section>
  )
}

export default InvestorPoolPerformanceSection
