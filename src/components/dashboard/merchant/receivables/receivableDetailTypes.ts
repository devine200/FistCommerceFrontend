import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'
import type { ReceivableStage } from '@/types/receivables'
import type { MerchantReceivableRepayState } from '@/utils/merchantReceivableRepayEligibility'

export type LifecycleStepVariant = 'blue' | 'purple' | 'green' | 'sky' | 'red' | 'neutral'

export type ReceivableLifecycleStep = {
  label: string
  description: string
  date: string
  variant: LifecycleStepVariant
}

export type ReceivableDetailView = {
  row: ReceivableTableRow
  /** Linked merchant profile id for admin navigation. */
  merchantId: string
  stage: ReceivableStage
  subtitle: string
  heroMetrics: { id: string; title: string; primaryValue: string; secondaryValue: string; icon: 'money' | 'dollar' }[]
  lifecycle: ReceivableLifecycleStep[]
  repaymentRows: { label: string; value: string }[]
  maturityBanner: string
  basicInfo: { label: string; value: string }[]
  documentName: string
  /** When set, links to this URL (e.g. IPFS gateway). */
  documentUrl: string | null
  repayState: MerchantReceivableRepayState
}

export const LOAN_VERIFICATION_FILE_LABEL = 'Loan Verification File'
