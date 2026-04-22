import InvestorPortfolioSummaryCard from '@/components/dashboard/investor/profile/InvestorPortfolioSummaryCard'
import {
  buildMerchantPortfolioMetricsFromApi,
  MERCHANT_PORTFOLIO,
} from '@/components/dashboard/merchant/profile/merchantProfileConfig'
import { useAppSelector } from '@/store/hooks'
import { useMemo } from 'react'

const MerchantProfileOverviewTabContent = () => {
  const merchantMetrics = useAppSelector((s) => s.merchantDashboard.merchantMetrics)
  const poolMetrics = useAppSelector((s) => s.merchantDashboard.poolMetrics)
  const lendingPool = useAppSelector((s) => s.merchantDashboard.lendingPools)

  const metrics = useMemo(
    () => buildMerchantPortfolioMetricsFromApi(merchantMetrics, poolMetrics),
    [merchantMetrics, poolMetrics],
  )

  const poolName = lendingPool.poolTitle?.trim() || MERCHANT_PORTFOLIO.poolName

  return (
    <InvestorPortfolioSummaryCard
      title={MERCHANT_PORTFOLIO.title}
      poolName={poolName}
      poolMeta={MERCHANT_PORTFOLIO.poolMeta}
      metrics={metrics}
    />
  )
}

export default MerchantProfileOverviewTabContent
