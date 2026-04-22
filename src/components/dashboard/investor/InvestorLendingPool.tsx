import LendingPoolOpportunityCard from '@/components/dashboard/LendingPoolOpportunityCard'
import DashboardSectionTitle from '@/components/dashboard/shared/DashboardSectionTitle'
import { useAppSelector } from '@/store/hooks'

const InvestorLendingPool = () => {
  const pool = useAppSelector((s) => s.investorDashboard.lendingPools)

  return (
    <section className="flex flex-col gap-4">
      <DashboardSectionTitle>Lending Pools</DashboardSectionTitle>
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
    </section>
  )
}

export default InvestorLendingPool
