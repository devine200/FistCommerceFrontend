import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import DashboardSessionGuard from '@/components/session/DashboardSessionGuard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshInvestorDashboard, setInvestorWalletDisplay } from '@/store/slices/investorDashboardSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'

function topBarWalletFromAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function InvestorDashboardSessionLayout() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const role = useAppSelector((s) => s.auth.role)
  const status = useAppSelector((s) => s.investorDashboard.status)
  const error = useAppSelector((s) => s.investorDashboard.error)
  const { isConnected, address } = useActiveWallet()
  const [errorOpen, setErrorOpen] = useState(false)
  const didKickoffRef = useRef(false)

  /** Keep dashboard top-bar wallet in sync with Privy-selected active wallet. */
  useEffect(() => {
    if (!isConnected || !address) return
    dispatch(setInvestorWalletDisplay(topBarWalletFromAddress(address)))
  }, [dispatch, isConnected, address])

  useEffect(() => {
    // When the session changes (reload / login / logout), allow a new kickoff.
    didKickoffRef.current = false
  }, [accessToken, role])

  useEffect(() => {
    if (didKickoffRef.current) return
    if (status !== 'idle') return
    if (!accessToken?.trim()) return
    if (role !== 'investor') return
    didKickoffRef.current = true
    void dispatch(refreshInvestorDashboard())
  }, [dispatch, status, accessToken, role])

  useEffect(() => {
    if (status === 'failed') setErrorOpen(true)
  }, [status])

  const errorMessage = useMemo(() => {
    const msg = error?.trim()
    return msg?.length ? msg : 'Dashboard sync failed. Please check your connection and try again.'
  }, [error])

  return (
    <>
      <DashboardSessionGuard />
      <DashboardErrorModal
        open={errorOpen && status === 'failed'}
        message={errorMessage}
        onClose={() => setErrorOpen(false)}
        onRetry={() => void dispatch(refreshInvestorDashboard())}
      />
      {status === 'loading' ? (
        <div className="fixed inset-0 z-75">
          <DashboardFullPageLoading label="Syncing investor dashboard…" />
        </div>
      ) : null}
      <Outlet />
    </>
  )
}
