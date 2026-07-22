import { Outlet } from 'react-router-dom'

import ArbitrumSepoliaWalletEnforcer from '@/components/session/ArbitrumSepoliaWalletEnforcer'
import AuthSessionChainGuard from '@/components/session/AuthSessionChainGuard'
import NetworkSessionBadge from '@/components/session/NetworkSessionBadge'
import SessionExpiredModal from '@/components/session/SessionExpiredModal'

export default function AppShell() {
  return (
    <>
      <NetworkSessionBadge />
      <AuthSessionChainGuard />
      <ArbitrumSepoliaWalletEnforcer />
      <SessionExpiredModal />
      <Outlet />
    </>
  )
}
