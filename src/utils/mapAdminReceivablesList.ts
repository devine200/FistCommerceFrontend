import type { AdminReceivableListStatus } from '@/api/adminLoan'
import { displayDashboardMetricString } from '@/api/metrics'

export function adminReceivableStatusLabel(status: AdminReceivableListStatus): string {
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

export function formatAdminReceivableLoanAmount(amount: string): string {
  return displayDashboardMetricString(amount)
}

export function formatAdminReceivablePeriodDays(days: number | null): string {
  if (days == null || !Number.isFinite(days)) return '—'
  return `${Math.round(days)} Days`
}

export function formatAdminReceivablesCount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
