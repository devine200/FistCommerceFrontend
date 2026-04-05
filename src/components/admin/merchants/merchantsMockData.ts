import { MERCHANT_RECEIVABLES_ROWS } from '@/components/dashboard/merchant/receivables/merchantReceivablesConfig'
import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'

export type MerchantKycLabel = 'Verified' | 'Rejected' | 'Under Review'

export type MerchantTableRow = {
  id: string
  receivableId: string
  merchantName: string
  merchantWallet: string
  industry: string
  totalLoans: string
  currentDebtOwed: string
  status: 'Pending' | 'Rejected' | 'Approved' | 'Under Review'
  receivablesCountLabel: string
}

export type MerchantProfileDetail = {
  id: string
  displayName: string
  walletLabel: string
  businessName: string
  kycLabel: MerchantKycLabel
  registrationDate: string
  accountStatus: 'Active' | 'Inactive'
  receivablesSubmittedLabel: string
  receivablesFundedLabel: string
  totalFundedAmount: string
  totalSettledAmount: string
  unpaidAmount: string
  /** Shown in “All Receivables” panel title count (may exceed listed mock rows). */
  allReceivablesPanelCount: number
  /** Shown in “Active Receivables” panel (demo: none). */
  activeReceivables: ReceivableTableRow[]
  /** Shown in “All Receivables” panel. */
  allReceivables: ReceivableTableRow[]
}

export const MERCHANT_TABLE_ROWS: MerchantTableRow[] = [
  {
    id: 'm-1',
    receivableId: 'r-1',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'SaaS',
    totalLoans: '$323,000',
    currentDebtOwed: '-$23,000',
    status: 'Pending',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'm-2',
    receivableId: 'r-2',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Cloud Infra',
    totalLoans: '$420,000',
    currentDebtOwed: '-$63,000',
    status: 'Rejected',
    receivablesCountLabel: '7 Receivables',
  },
  {
    id: 'm-3',
    receivableId: 'r-3',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Manufacturing',
    totalLoans: '$103,500',
    currentDebtOwed: '$0',
    status: 'Approved',
    receivablesCountLabel: '3 Receivables',
  },
  {
    id: 'm-4',
    receivableId: 'r-4',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Data Storage',
    totalLoans: '$23,000',
    currentDebtOwed: '-$23,000',
    status: 'Under Review',
    receivablesCountLabel: '1 Receivables',
  },
  {
    id: 'm-5',
    receivableId: 'r-5',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Trade',
    totalLoans: '$400,000',
    currentDebtOwed: '$0',
    status: 'Approved',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'm-6',
    receivableId: 'r-6',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Consulting',
    totalLoans: '$150,000',
    currentDebtOwed: '$0',
    status: 'Under Review',
    receivablesCountLabel: '11 Receivables',
  },
]

function cloneReceivableRows(rows: ReceivableTableRow[]): ReceivableTableRow[] {
  return rows.map((r) => ({ ...r }))
}

function profileFromMerchantRow(row: MerchantTableRow): MerchantProfileDetail {
  const kycLabel: MerchantKycLabel =
    row.status === 'Approved' ? 'Verified' : row.status === 'Rejected' ? 'Rejected' : 'Under Review'

  return {
    id: row.id,
    displayName: row.merchantName,
    walletLabel: row.merchantWallet,
    businessName: 'Ajala Trading Solutions',
    kycLabel,
    registrationDate: '24th March 2026',
    accountStatus: 'Active',
    receivablesSubmittedLabel: '13 Receivables',
    receivablesFundedLabel: '10 Receivables',
    totalFundedAmount: '$34,000',
    totalSettledAmount: '$40,000',
    unpaidAmount: '$0.00',
    allReceivablesPanelCount: 13,
    activeReceivables: [],
    allReceivables: cloneReceivableRows(MERCHANT_RECEIVABLES_ROWS),
  }
}

export type AdminMerchantsDataState = {
  tableRows: MerchantTableRow[]
  profilesById: Record<string, MerchantProfileDetail>
}

export function getAdminMerchantsInitialState(): AdminMerchantsDataState {
  const profilesById: Record<string, MerchantProfileDetail> = {}
  for (const r of MERCHANT_TABLE_ROWS) {
    profilesById[r.id] = profileFromMerchantRow(r)
  }
  return {
    tableRows: MERCHANT_TABLE_ROWS.map((r) => ({ ...r })),
    profilesById,
  }
}
