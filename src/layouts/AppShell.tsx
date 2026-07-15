import { Outlet } from 'react-router-dom'

import ArbitrumSepoliaWalletEnforcer from '@/components/session/ArbitrumSepoliaWalletEnforcer'
import SessionExpiredModal from '@/components/session/SessionExpiredModal'

export default function AppShell() {
  return (
    <>
      <ArbitrumSepoliaWalletEnforcer />
      <SessionExpiredModal />
      <Outlet />
    </>
  )
}
