import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'

import type { MerchantProfileOverviewContentProps } from './types'

function MerchantProfileOverviewContent({ name, email, stats, tabs }: MerchantProfileOverviewContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <InvestorProfileHero name={name} email={email} />
      <InvestorProfileStatsGrid stats={stats} />
      <InvestorProfileTabs tabs={tabs} />
    </div>
  )
}

export default MerchantProfileOverviewContent
export type { MerchantProfileOverviewContentProps } from './types'
