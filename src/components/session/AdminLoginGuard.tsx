import { Navigate } from 'react-router-dom'

import { evaluateAdminLoginPath } from '@/access/evaluateAccess'
import { useAccessContext } from '@/hooks/useAccessContext'

/** Redirects authenticated admins away from the login screen. */
export default function AdminLoginGuard() {
  const ctx = useAccessContext()
  const decision = evaluateAdminLoginPath(ctx)

  if (!decision.allowed && decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />
  }

  return null
}
