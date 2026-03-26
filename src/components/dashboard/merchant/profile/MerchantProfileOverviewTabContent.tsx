import InvestorPortfolioSummaryCard from '@/components/dashboard/investor/profile/InvestorPortfolioSummaryCard'
import { MERCHANT_PORTFOLIO, MERCHANT_PORTFOLIO_METRICS } from '@/components/dashboard/merchant/profile/merchantProfileConfig'

const MerchantProfileOverviewTabContent = () => {
  return (
    <InvestorPortfolioSummaryCard
      title={MERCHANT_PORTFOLIO.title}
      poolName={MERCHANT_PORTFOLIO.poolName}
      poolMeta={MERCHANT_PORTFOLIO.poolMeta}
      metrics={MERCHANT_PORTFOLIO_METRICS}
    />
  )
}

export default MerchantProfileOverviewTabContent
