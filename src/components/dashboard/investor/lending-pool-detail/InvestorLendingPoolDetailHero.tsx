import { Link } from 'react-router-dom'

import PoolMetricsGrid from '@/components/dashboard/investor/lending-pool-detail/PoolMetricsGrid'
import type { PoolStatItem } from '@/components/dashboard/investor/lending-pool-detail/types'
import { POOL_DETAIL_SUBTITLE, POOL_DETAIL_TITLE } from '@/components/dashboard/shared/poolDetailTypography'

interface InvestorLendingPoolDetailHeroProps {
  title: string
  subtitle: string
  stats: PoolStatItem[]
  howItWorksTo: string
}

const PoolHelpButton = ({ to }: { to: string }) => (
  <Link
    to={to}
    aria-label="How lending pools work"
    className="inline-flex h-[22px] min-w-[22px] px-0.5 shrink-0 items-center justify-center rounded-full border border-[#195EBC] text-[#195EBC] text-[13px] font-bold leading-none hover:bg-[#E8EFFB]"
  >
    ?
  </Link>
)

const InvestorLendingPoolDetailHero = ({ title, subtitle, stats, howItWorksTo }: InvestorLendingPoolDetailHeroProps) => {
  return (
    <section className="rounded-[12px] bg-white border border-[#E6E8EC] px-4 py-5 sm:px-6 sm:py-6 lg:bg-[#EBEEF3] lg:border-0 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
              <h1 className={`${POOL_DETAIL_TITLE} inline`}>{title}</h1>
              <PoolHelpButton to={howItWorksTo} />
            </div>
            <p className={POOL_DETAIL_SUBTITLE}>{subtitle}</p>
          </div>
        </div>
        <div className="pt-1">
          <PoolMetricsGrid stats={stats} />
        </div>
      </div>
    </section>
  )
}

export default InvestorLendingPoolDetailHero
