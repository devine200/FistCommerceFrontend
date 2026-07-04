import type {
  AdminMerchantListStatus,
  AdminMerchantProfileReceivableRow,
  AdminMerchantProfileResult,
  AdminMerchantRepaymentDue,
} from '@/api/adminKycMerchants'
import { displayDashboardMetricString } from '@/api/metrics'
import type { MerchantKycLabel, MerchantProfileDetail } from '@/components/admin/merchants/merchantsMockData'
import type { ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'
import { shortWalletDisplay } from '@/utils/shortWalletDisplay'

export function adminMerchantStatusLabel(status: AdminMerchantListStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'under_review':
      return 'Under Review'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return status
  }
}

function kycLabelFromApi(label: string): MerchantKycLabel {
  const normalized = label.trim()
  if (
    normalized === 'Verified' ||
    normalized === 'Rejected' ||
    normalized === 'Under Review' ||
    normalized === 'Pending' ||
    normalized === 'Approved'
  ) {
    return normalized
  }
  return 'Under Review'
}

export function formatAdminMerchantsCount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatAdminMerchantMoney(amount: string): string {
  return displayDashboardMetricString(amount)
}

export function formatAdminMerchantReceivablesCount(count: number): string {
  if (!Number.isFinite(count)) return '—'
  const n = Math.max(0, Math.round(count))
  return `${n.toLocaleString('en-US')} Receivable${n === 1 ? '' : 's'}`
}

function formatIsoDateForDisplay(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—'
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return iso.trim()
}

function repaymentDueVariant(
  due: AdminMerchantRepaymentDue,
  debtStatus: string,
): ReceivableTableRow['repaymentDueVariant'] {
  const status = debtStatus.trim().toLowerCase()
  if (status === 'repaid' || due.tone === 'success') return 'repaid'
  if (status === 'defaulted' || due.tone === 'danger') return 'overdue'
  return 'upcoming'
}

function debtStatusVariant(debtStatus: string): ReceivableTableRow['debtStatusVariant'] {
  const s = debtStatus.trim().toLowerCase()
  if (s === 'repaid') return 'repaid'
  if (s === 'defaulted') return 'defaulted'
  return 'unpaid'
}

function mapProfileReceivableRow(row: AdminMerchantProfileReceivableRow): ReceivableTableRow {
  const aprDisplay =
    row.apr != null && Number.isFinite(row.apr)
      ? `${row.apr.toLocaleString('en-US', { maximumFractionDigits: 2 })}% APR`
      : '—'
  const debtVariant = debtStatusVariant(row.debtStatus)
  const interestFormatted = row.repaymentAmount.interest
    ? formatAdminMerchantMoney(row.repaymentAmount.interest)
    : null

  return {
    id: row.loanId,
    receivableName: row.receivableName,
    loanAmount: formatAdminMerchantMoney(row.loanAmount),
    apr: aprDisplay,
    repaymentDue: row.repaymentDue.label?.trim() || '—',
    repaymentDueVariant: repaymentDueVariant(row.repaymentDue, row.debtStatus),
    repaymentAmount: formatAdminMerchantMoney(row.repaymentAmount.total),
    interestSubline:
      interestFormatted && interestFormatted !== '—'
        ? `${interestFormatted} Interest`
        : aprDisplay !== '—'
          ? aprDisplay
          : undefined,
    debtStatus: row.debtStatusLabel,
    debtStatusVariant: debtVariant,
    rowEmphasis: debtVariant === 'defaulted',
  }
}

export function mapAdminMerchantProfileToDetail(detail: AdminMerchantProfileResult): MerchantProfileDetail {
  const { profile, summary, activeReceivables, allReceivables } = detail

  return {
    id: String(profile.merchantUserId),
    kycId: profile.kycId,
    displayName: profile.displayName,
    wallet: profile.wallet,
    walletLabel: shortWalletDisplay(profile.wallet),
    businessName: profile.businessName || profile.displayName,
    kycLabel: kycLabelFromApi(profile.kycStatusLabel),
    kycVerified: profile.kycVerified,
    insuranceVerified: profile.insuranceVerified,
    diditStatus: profile.diditStatus,
    pendingMultisigProposalId: profile.pendingMultisigProposalId,
    registrationDate: formatIsoDateForDisplay(profile.registrationDate),
    accountStatus: profile.accountStatusLabel === 'Inactive' ? 'Inactive' : 'Active',
    receivablesSubmittedLabel: formatAdminMerchantReceivablesCount(summary.totalReceivablesSubmitted),
    receivablesFundedLabel: formatAdminMerchantReceivablesCount(summary.totalReceivablesFunded),
    totalFundedAmount: formatAdminMerchantMoney(summary.totalFundedAmount),
    totalSettledAmount: formatAdminMerchantMoney(summary.totalSettledAmount),
    unpaidAmount: formatAdminMerchantMoney(summary.unpaidAmount),
    allReceivablesPanelCount: allReceivables.count,
    activeReceivables: activeReceivables.results.map(mapProfileReceivableRow),
    allReceivables: allReceivables.results.map(mapProfileReceivableRow),
  }
}

/** @deprecated Use mapAdminMerchantProfileToDetail */
export const mapAdminMerchantDetailToProfile = mapAdminMerchantProfileToDetail
