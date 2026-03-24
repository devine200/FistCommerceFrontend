import LendingPoolDetailHeroBanner from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailHeroBanner'
import LendingPoolDetailOverview from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailOverview'
import MerchantLoansTable from '@/components/dashboard/merchant/lending-pool-detail/MerchantLoansTable'
import type { LendingPoolDetailConfig } from '@/components/dashboard/merchant/lending-pool-detail/types'

interface LendingPoolDetailPageContentProps {
  config: LendingPoolDetailConfig
}

const LendingPoolDetailPageContent = ({ config }: LendingPoolDetailPageContentProps) => {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <LendingPoolDetailHeroBanner title={config.title} subtitle={config.subtitle} stats={config.stats} />
      <LendingPoolDetailOverview
        overviewParagraphs={config.overviewParagraphs}
        financialInfoRows={config.financialInfoRows}
        termsForLoanRows={config.termsForLoanRows}
      />
      <MerchantLoansTable loans={config.loans} />
    </div>
  )
}

export default LendingPoolDetailPageContent
