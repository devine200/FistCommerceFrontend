import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'
import {
  MERCHANT_PROFILE,
  MERCHANT_PROFILE_STATS,
  MERCHANT_PROFILE_TABS,
} from '@/components/dashboard/merchant/profile/merchantProfileConfig'

const MerchantProfileOverviewContent = () => {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <InvestorProfileHero name={MERCHANT_PROFILE.name} email={MERCHANT_PROFILE.email} />
      <InvestorProfileStatsGrid stats={MERCHANT_PROFILE_STATS} />
      <InvestorProfileTabs tabs={MERCHANT_PROFILE_TABS} />
    </div>
  )
}

export default MerchantProfileOverviewContent
