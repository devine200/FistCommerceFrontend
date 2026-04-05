import type { MerchantProfileDetail } from '@/components/admin/merchants/merchantsMockData'
import type { InvestorProfileStatColumn } from '@/components/admin/investors/profile/types'

export function buildMerchantProfileStatColumns(profile: MerchantProfileDetail): {
  statColumns: InvestorProfileStatColumn[]
} {
  const col1: InvestorProfileStatColumn = [
    { label: 'Business Name', value: profile.businessName },
    { label: 'KYC Status', value: profile.kycLabel },
    { label: 'Registration Date', value: profile.registrationDate },
  ]
  const col2: InvestorProfileStatColumn = [
    { label: 'Account Status', value: profile.accountStatus },
    { label: 'Total Receivables Submitted', value: profile.receivablesSubmittedLabel },
    { label: 'Total Receivables Funded', value: profile.receivablesFundedLabel },
  ]
  const col3: InvestorProfileStatColumn = [
    { label: 'Total Funded Amount', value: profile.totalFundedAmount },
    { label: 'Total Settled Amount', value: profile.totalSettledAmount },
    { label: 'Unpaid Amount', value: profile.unpaidAmount },
  ]
  return { statColumns: [col1, col2, col3] }
}
