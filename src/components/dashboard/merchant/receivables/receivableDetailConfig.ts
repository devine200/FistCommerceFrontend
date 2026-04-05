import { MERCHANT_RECEIVABLES_ROWS } from '@/components/dashboard/merchant/receivables/merchantReceivablesConfig'
import type { ReceivableDetailView } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'
import { ReceivableStage } from '@/types/receivables'

const DEMO_LIFECYCLE: ReceivableDetailView['lifecycle'] = [
  {
    label: 'Receivable Created',
    description:
      'Your receivable has been successfully created. Please be patient while we verify your information.',
    date: '03-04-2026',
    variant: 'blue',
  },
  {
    label: 'Receivable Verified',
    description: 'Your receivable has been verified and approved for funding on the lending pool.',
    date: '04-04-2026',
    variant: 'purple',
  },
  {
    label: 'Receivable Funded',
    description: 'Capital has been disbursed to your account and your receivable facility is now active.',
    date: '10-04-2026',
    variant: 'green',
  },
  {
    label: 'Loan Matured',
    description: 'Your receivable has reached maturity and repayment is now due.',
    date: '24-05-2026',
    variant: 'sky',
  },
  {
    label: 'Loan Repaid',
    description: 'Your loan has been repaid in full and the receivable is closed.',
    date: '26-05-2026',
    variant: 'neutral',
  },
]

const DEMO_REPAYMENT: ReceivableDetailView['repaymentRows'] = [
  { label: 'Repayment due date', value: '24-05-2026' },
  { label: 'Loan Duration', value: '45 Days' },
  { label: 'Repayment Structure', value: 'Bullet' },
  { label: 'Grace Period', value: 'N/A' },
  { label: 'Late Payment Penalty', value: '0.6% APR per month' },
]

const DEMO_BASIC: ReceivableDetailView['basicInfo'] = [
  { label: 'Full Name', value: 'Dave Chinemerem' },
  { label: 'Business Name', value: "Dave's Enterprises" },
  { label: 'Industry', value: 'Retail' },
  { label: 'Years in Operation', value: '6+ years' },
]

const RECEIVABLE_ID_TO_MERCHANT_ID: Record<string, string> = {
  'r-1': 'm-1',
  'r-2': 'm-2',
  'r-3': 'm-3',
  'r-4': 'm-4',
  'r-5': 'm-5',
  'r-6': 'm-6',
  'r-7': 'm-6',
  'r-8': 'm-6',
}

export const getReceivableDetailById = (receivableId: string): ReceivableDetailView | null => {
  const row = MERCHANT_RECEIVABLES_ROWS.find((r) => r.id === receivableId)
  if (!row) return null

  const stageById: Partial<Record<string, ReceivableStage>> = {
    'r-1': ReceivableStage.Created,
    'r-2': ReceivableStage.Verified,
    'r-3': ReceivableStage.Funded,
    'r-4': ReceivableStage.Matured,
    'r-5': ReceivableStage.Repaid,
  }

  return {
    row,
    merchantId: RECEIVABLE_ID_TO_MERCHANT_ID[receivableId] ?? 'm-1',
    stage: stageById[receivableId] ?? ReceivableStage.Verified,
    subtitle: 'Moderate risk, Moderate returns.',
    heroMetrics: [
      {
        id: 'total',
        title: 'Total Amount',
        primaryValue: '$340K',
        secondaryValue: '$340,000 USDT',
        icon: 'money',
      },
      {
        id: 'funding',
        title: 'Funding',
        primaryValue: '$340K',
        secondaryValue: '$340,000 USDT',
        icon: 'dollar',
      },
      {
        id: 'owed',
        title: 'Amount Owed',
        primaryValue: '$400K',
        secondaryValue: `${row.apr} APR`,
        icon: 'money',
      },
    ],
    lifecycle: DEMO_LIFECYCLE,
    repaymentRows: DEMO_REPAYMENT,
    maturityBanner: 'Loan Maturing in 56 Days',
    basicInfo: DEMO_BASIC,
    documentName: 'Inv-daveenterprise-011',
  }
}
