import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'
import type { ReceivableStage } from '@/types/receivables'

export type LifecycleStepVariant = 'blue' | 'purple' | 'green' | 'sky' | 'neutral'

export type ReceivableLifecycleStep = {
  label: string
  description: string
  date: string
  variant: LifecycleStepVariant
}

export type ReceivableDetailView = {
  row: ReceivableTableRow
  stage: ReceivableStage
  subtitle: string
  heroMetrics: { id: string; title: string; primaryValue: string; secondaryValue: string; icon: 'money' | 'dollar' }[]
  lifecycle: ReceivableLifecycleStep[]
  repaymentRows: { label: string; value: string }[]
  maturityBanner: string
  basicInfo: { label: string; value: string }[]
  documentName: string
}
