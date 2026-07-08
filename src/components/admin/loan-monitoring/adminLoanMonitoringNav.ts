export const ADMIN_LOAN_MONITORING_LIST_PATH = '/dashboard/admin/loan-monitoring'

const RETURN_TO_QUERY_KEY = 'returnTo'
export const ADMIN_LOAN_MONITORING_PAYOUT_FOCUS_QUERY_KEY = 'focus'
export const ADMIN_LOAN_MONITORING_FUNDING_APPROVAL_FOCUS_VALUE = 'funding-approval'
export const ADMIN_LOAN_MONITORING_FUNDING_PAYOUT_FOCUS_VALUE = 'funding-payout'
/** @deprecated Use {@link ADMIN_LOAN_MONITORING_FUNDING_PAYOUT_FOCUS_VALUE}. */
export const ADMIN_LOAN_MONITORING_PAYOUT_FOCUS_VALUE = ADMIN_LOAN_MONITORING_FUNDING_PAYOUT_FOCUS_VALUE

export function isSafeAdminAppPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  return path.startsWith('/dashboard/admin')
}

export function resolveAdminLoanMonitoringBackTarget(queryReturnTo: string | null): string {
  if (queryReturnTo && isSafeAdminAppPath(queryReturnTo)) {
    return queryReturnTo
  }
  return ADMIN_LOAN_MONITORING_LIST_PATH
}

export function adminLoanMonitoringDetailHref(
  loanId: string,
  returnTo?: string,
  focus?: 'funding-approval' | 'funding-payout',
): string {
  const q = new URLSearchParams()
  if (returnTo && isSafeAdminAppPath(returnTo)) {
    q.set(RETURN_TO_QUERY_KEY, returnTo)
  }
  if (focus === 'funding-approval') {
    q.set(ADMIN_LOAN_MONITORING_PAYOUT_FOCUS_QUERY_KEY, ADMIN_LOAN_MONITORING_FUNDING_APPROVAL_FOCUS_VALUE)
  } else if (focus === 'funding-payout') {
    q.set(ADMIN_LOAN_MONITORING_PAYOUT_FOCUS_QUERY_KEY, ADMIN_LOAN_MONITORING_FUNDING_PAYOUT_FOCUS_VALUE)
  }
  const base = `${ADMIN_LOAN_MONITORING_LIST_PATH}/${loanId}`
  const query = q.toString()
  return query ? `${base}?${query}` : base
}

export const ADMIN_LOAN_MONITORING_RETURN_QUERY_KEY = RETURN_TO_QUERY_KEY
