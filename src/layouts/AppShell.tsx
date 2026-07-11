import { Outlet } from 'react-router-dom'

import ArbitrumSepoliaWalletEnforcer from '@/components/session/ArbitrumSepoliaWalletEnforcer'

export default function AppShell() {
  return (
    <>
      <ArbitrumSepoliaWalletEnforcer />
      <Outlet />
    </>
  )
}
