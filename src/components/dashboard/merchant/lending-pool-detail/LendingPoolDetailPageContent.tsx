import LendingPoolDetailHeroBanner from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailHeroBanner'
import LendingPoolDetailOverview from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailOverview'
import MerchantLoansTable from '@/components/dashboard/merchant/lending-pool-detail/MerchantLoansTable'
import type { LendingPoolDetailConfig } from '@/components/dashboard/merchant/lending-pool-detail/types'
import { useNavigate } from 'react-router-dom'

interface LendingPoolDetailPageContentProps {
  config: LendingPoolDetailConfig
  onApplyToBorrow?: () => void
}

const LendingPoolDetailPageContent = ({ config, onApplyToBorrow }: LendingPoolDetailPageContentProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[#6B7488] text-[13px] inline-flex items-center gap-2 hover:text-[#195EBC]"
        >
          <span aria-hidden>←</span>
          Back
        </button>
      </div>
      <LendingPoolDetailHeroBanner
        title={config.title}
        subtitle={config.subtitle}
        stats={config.stats}
        onApplyToBorrow={onApplyToBorrow}
      />
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
