import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'
import {
  INVESTOR_PROFILE,
  INVESTOR_PROFILE_STATS,
  INVESTOR_PROFILE_TABS,
} from '@/components/dashboard/investor/profile/profileConfig'

const InvestorProfileOverviewContent = () => {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <InvestorProfileHero name={INVESTOR_PROFILE.name} email={INVESTOR_PROFILE.email} />
      <InvestorProfileStatsGrid stats={INVESTOR_PROFILE_STATS} />
      <InvestorProfileTabs tabs={INVESTOR_PROFILE_TABS} />
    </div>
  )
}

export default InvestorProfileOverviewContent
