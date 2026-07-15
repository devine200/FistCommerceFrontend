import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import {
  connectWalletPathForRole,
  getSessionEndMessage,
  stashSessionEndMessage,
} from '@/session/sessionEnd'
import { logoutUserSession } from '@/session/logoutUserSession'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { parseUserRole } from '@/utils/userRole'
import { useActiveWallet } from '@/wallet/useActiveWallet'

/**
 * Blocking modal when API refresh fails. User must Log in again (re-sign) or Log out (Privy disconnect).
 */
export default function SessionExpiredModal() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { logout } = usePrivy()
  const { wallet } = useActiveWallet()
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired)
  const sessionExpiredReason = useAppSelector((s) => s.auth.sessionExpiredReason)
  const roleRaw = useAppSelector((s) => s.auth.role)
  const role = parseUserRole(roleRaw)

  const [loggingOut, setLoggingOut] = useState(false)

  if (!sessionExpired) return null

  const message = getSessionEndMessage(sessionExpiredReason)

  const handleLogInAgain = () => {
    if (loggingOut) return
    if (sessionExpiredReason) {
      stashSessionEndMessage(sessionExpiredReason, role)
    }
    dispatch(
      patchAuth({
        sessionExpired: false,
        sessionExpiredReason: null,
      }),
    )
    navigate(connectWalletPathForRole(role), { replace: true })
  }

  const handleLogOut = () => {
    if (loggingOut) return
    setLoggingOut(true)
    void logoutUserSession(dispatch, wallet, logout).catch(() => {
      setLoggingOut(false)
    })
  }

  return (
    <DashboardErrorModal
      open
      blocking
      title="Your session expired"
      message={message}
      onClose={() => {}}
      onRetry={handleLogInAgain}
      retryLabel={loggingOut ? 'Please wait…' : 'Log in again'}
      retryDisabled={loggingOut}
      onSecondary={handleLogOut}
      secondaryLabel={loggingOut ? 'Logging out…' : 'Log out'}
    />
  )
}
