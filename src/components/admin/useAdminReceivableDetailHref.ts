import { useLocation } from 'react-router-dom'

import { adminReceivableDetailHref } from '@/components/admin/adminReceivableReturnNav'

/** Receivable detail URLs whose back target is this page (`pathname` + `search`). */
export function useAdminReceivableDetailHref() {
  const location = useLocation()
  const returnTo = `${location.pathname}${location.search}`
  return (receivableId: string) => adminReceivableDetailHref(receivableId, returnTo)
}
