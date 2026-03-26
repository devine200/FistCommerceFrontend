import InvestorPortfolioSummaryCard from '@/components/dashboard/investor/profile/InvestorPortfolioSummaryCard'
import { INVESTOR_PORTFOLIO, INVESTOR_PORTFOLIO_METRICS } from '@/components/dashboard/investor/profile/profileConfig'

const InvestorProfileOverviewTabContent = () => {
  return (
    <InvestorPortfolioSummaryCard
      title={INVESTOR_PORTFOLIO.title}
      poolName={INVESTOR_PORTFOLIO.poolName}
      poolMeta={INVESTOR_PORTFOLIO.poolMeta}
      metrics={INVESTOR_PORTFOLIO_METRICS}
    />
  )
}

export default InvestorProfileOverviewTabContent
