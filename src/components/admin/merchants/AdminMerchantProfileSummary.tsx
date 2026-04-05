import { AdminInvestorProfileSummary } from '@/components/admin/investors/profile'

import type { AdminMerchantProfileSummaryProps } from './types'

export function AdminMerchantProfileSummary(props: AdminMerchantProfileSummaryProps) {
  return <AdminInvestorProfileSummary {...props} />
}
