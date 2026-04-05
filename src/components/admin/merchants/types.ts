import type { AdminInvestorProfileSummaryProps } from '@/components/admin/investors/profile/types'
import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'

import type { MerchantProfileDetail } from './merchantsMockData'

/** Admin merchant profile header: same layout as investor profile summary. */
export type AdminMerchantProfileSummaryProps = AdminInvestorProfileSummaryProps

export type AdminMerchantProfileReceivablesPanelsProps = {
  activeReceivables: ReceivableTableRow[]
  allReceivables: ReceivableTableRow[]
  /** Shown in the “All Receivables” panel title when different from `allReceivables.length`. */
  allReceivablesPanelCount: number
  activeSearchValue: string
  onActiveSearchChange: (value: string) => void
  allSearchValue: string
  onAllSearchChange: (value: string) => void
  activePanelTitle?: string
  allPanelTitle?: string
  activePanelSearchAriaLabel?: string
  allPanelSearchAriaLabel?: string
}

export type AdminMerchantProfileViewProps = {
  avatarSrc: string
  avatarAlt?: string
  profile: MerchantProfileDetail
}
