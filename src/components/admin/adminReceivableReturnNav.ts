/** Default when no valid `returnTo` is provided. */
export const ADMIN_RECEIVABLE_DEFAULT_BACK = '/dashboard/admin/receivables'

const RETURN_TO_QUERY_KEY = 'returnTo'

/** `location.state` key set by `Link` / `navigate` when opening receivable detail. */
export const ADMIN_RECEIVABLE_RETURN_STATE_KEY = 'adminReceivableReturnTo' as const

export type AdminReceivableLocationState = {
  [ADMIN_RECEIVABLE_RETURN_STATE_KEY]?: string
}

export function isSafeAdminAppPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  return path.startsWith('/dashboard/admin')
}

/**
 * Resolves where the receivable detail “back” control should navigate.
 * `state` wins over the query string (explicit navigation intent).
 */
export function resolveAdminReceivableBackTarget(
  stateReturnTo: unknown,
  queryReturnTo: string | null,
): string {
  if (typeof stateReturnTo === 'string' && isSafeAdminAppPath(stateReturnTo)) {
    return stateReturnTo
  }
  if (queryReturnTo && isSafeAdminAppPath(queryReturnTo)) {
    return queryReturnTo
  }
  return ADMIN_RECEIVABLE_DEFAULT_BACK
}

/** Path to admin receivable detail with optional safe return target (query). */
export function adminReceivableDetailHref(receivableId: string, returnTo?: string): string {
  const base = `/dashboard/admin/receivables/${receivableId}`
  if (!returnTo || !isSafeAdminAppPath(returnTo)) return base
  const q = new URLSearchParams({ [RETURN_TO_QUERY_KEY]: returnTo })
  return `${base}?${q.toString()}`
}

export { RETURN_TO_QUERY_KEY }
