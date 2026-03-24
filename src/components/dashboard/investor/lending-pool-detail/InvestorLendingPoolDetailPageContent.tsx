import type { InvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/types'
import InvestorLendingPoolDetailHero from '@/components/dashboard/investor/lending-pool-detail/InvestorLendingPoolDetailHero'
import InvestorMyStatsSection from '@/components/dashboard/investor/lending-pool-detail/InvestorMyStatsSection'
import InvestorPoolPerformanceSection from '@/components/dashboard/investor/lending-pool-detail/InvestorPoolPerformanceSection'
import InvestorPoolStrategySection from '@/components/dashboard/investor/lending-pool-detail/InvestorPoolStrategySection'
import InvestorSmartContractAndTransactionsSection from '@/components/dashboard/investor/lending-pool-detail/InvestorSmartContractAndTransactionsSection'

interface InvestorLendingPoolDetailPageContentProps {
  config: InvestorPoolDetailConfig
  poolSlug: string
}

const InvestorLendingPoolDetailPageContent = ({ config, poolSlug }: InvestorLendingPoolDetailPageContentProps) => {
  const howItWorksTo = `/dashboard/investor/lending-pool/${poolSlug}/how-it-works`

  return (
    <div className="flex flex-col gap-6 pb-8 min-w-0">
      <InvestorLendingPoolDetailHero
        title={config.title}
        subtitle={config.subtitle}
        stats={config.headerStats}
        howItWorksTo={howItWorksTo}
      />
      <InvestorMyStatsSection stats={config.myStats} />
      <InvestorPoolPerformanceSection stats={config.poolPerformanceStats} />
      <InvestorPoolStrategySection intro={config.strategyIntro} features={config.strategyFeatures} />
      <InvestorSmartContractAndTransactionsSection
        contractRows={config.contractRows}
        transactions={config.transactions}
      />
    </div>
  )
}

export default InvestorLendingPoolDetailPageContent
