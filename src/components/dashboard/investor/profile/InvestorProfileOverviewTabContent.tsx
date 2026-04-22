import { useMemo } from 'react'

import { displayPoolApyPercent } from '@/api/metrics'
import InvestorPortfolioSummaryCard from '@/components/dashboard/investor/profile/InvestorPortfolioSummaryCard'
import {
  buildInvestorPortfolioMetricsFromApi,
  INVESTOR_PORTFOLIO,
} from '@/components/dashboard/investor/profile/profileConfig'
import { useAppSelector } from '@/store/hooks'

const InvestorProfileOverviewTabContent = () => {
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)
  const poolMetrics = useAppSelector((s) => s.investorDashboard.poolMetrics)
  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)

  const metrics = useMemo(
    () => buildInvestorPortfolioMetricsFromApi(investorMetrics, poolMetrics),
    [investorMetrics, poolMetrics],
  )
  
  const poolName = lendingPool.poolTitle?.trim() || INVESTOR_PORTFOLIO.poolName
  const poolMeta = useMemo(() => {
    if (poolMetrics && Number.isFinite(poolMetrics.apy)) {
      return `${displayPoolApyPercent(poolMetrics.apy)} estimated pool yield`
    }
    return INVESTOR_PORTFOLIO.poolMeta
  }, [poolMetrics])

  return (
    <InvestorPortfolioSummaryCard
      title={INVESTOR_PORTFOLIO.title}
      poolName={poolName}
      poolMeta={poolMeta}
      metrics={metrics}
    />
  )
}

export default InvestorProfileOverviewTabContent
