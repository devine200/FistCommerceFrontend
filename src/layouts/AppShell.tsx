import { Outlet } from 'react-router-dom'

import ArbitrumSepoliaWalletEnforcer from '@/components/session/ArbitrumSepoliaWalletEnforcer'
import AuthSessionChainGuard from '@/components/session/AuthSessionChainGuard'
import SessionExpiredModal from '@/components/session/SessionExpiredModal'

export default function AppShell() {
  return (
    <>
      <AuthSessionChainGuard />
      <ArbitrumSepoliaWalletEnforcer />
      <SessionExpiredModal />
      <Outlet />
    </>
  )
}
