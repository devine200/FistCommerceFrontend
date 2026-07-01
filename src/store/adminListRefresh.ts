/** Track in-flight admin list fetches and ignore stale responses. */

export type AdminListRequestState = {
  listRequestId: string | null
}

export function markAdminListRequestPending<T extends AdminListRequestState>(
  state: T,
  requestId: string,
): void {
  state.listRequestId = requestId
}

export function isLatestAdminListRequest<T extends AdminListRequestState>(
  state: T,
  requestId: string,
): boolean {
  return state.listRequestId === requestId
}
