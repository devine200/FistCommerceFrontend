import type { InvestorProfileStat, InvestorProfileTab } from '@/components/dashboard/investor/profile/types'

export type MerchantProfileOverviewContentProps = {
  name: string
  email: string
  stats: InvestorProfileStat[]
  tabs: InvestorProfileTab[]
}
