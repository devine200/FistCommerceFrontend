export const ADMIN_LOAN_MONITORING_LIST_PATH = '/dashboard/admin/loan-monitoring'

const RETURN_TO_QUERY_KEY = 'returnTo'

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

export function adminLoanMonitoringDetailHref(loanId: string, returnTo?: string): string {
  const base = `${ADMIN_LOAN_MONITORING_LIST_PATH}/${loanId}`
  if (!returnTo || !isSafeAdminAppPath(returnTo)) return base
  const q = new URLSearchParams({ [RETURN_TO_QUERY_KEY]: returnTo })
  return `${base}?${q.toString()}`
}

export const ADMIN_LOAN_MONITORING_RETURN_QUERY_KEY = RETURN_TO_QUERY_KEY
