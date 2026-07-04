import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
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
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)
  const didKickoffRef = useRef(false)

  useEffect(() => {
    if (!isConnected || !address) return
    dispatch(setInvestorWalletDisplay(topBarWalletFromAddress(address)))
  }, [dispatch, isConnected, address])

  useEffect(() => {
    didKickoffRef.current = false
    setErrorDismissed(false)
    setLoadingDismissed(false)
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
    if (status === 'failed') setErrorDismissed(false)
    if (status === 'loading') setLoadingDismissed(false)
    if (status === 'succeeded') setLoadingDismissed(false)
  }, [status])

  const feedbackPhase =
    status === 'loading' && !loadingDismissed
      ? 'loading'
      : status === 'failed' && !errorDismissed
        ? 'failed'
        : 'idle'

  return (
    <>
      <DashboardSessionGuard />
      <DashboardRequestFeedbackLayer
        phase={feedbackPhase}
        loadingTitle="Syncing investor dashboard"
        loadingDescription="Fetching the latest data for your account…"
        errorTitle="Unable to load dashboard"
        errorDescription={error ?? undefined}
        onDismiss={() => setErrorDismissed(true)}
        onRetry={() => {
          setErrorDismissed(false)
          void dispatch(refreshInvestorDashboard())
        }}
        onCancelLoading={() => setLoadingDismissed(true)}
      />
      <Outlet />
    </>
  )
}
