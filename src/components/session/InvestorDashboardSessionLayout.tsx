import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import DashboardSessionGuard from '@/components/session/DashboardSessionGuard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshInvestorDashboard } from '@/store/slices/investorDashboardSlice'

export default function InvestorDashboardSessionLayout() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const status = useAppSelector((s) => s.investorDashboard.status)
  const error = useAppSelector((s) => s.investorDashboard.error)
  const [errorOpen, setErrorOpen] = useState(false)
  const didKickoffRef = useRef(false)

  useEffect(() => {
    // When the session changes (reload / login / logout), allow a new kickoff.
    didKickoffRef.current = false
  }, [accessToken])

  useEffect(() => {
    if (didKickoffRef.current) return
    if (status !== 'idle') return
    if (!accessToken?.trim()) return
    didKickoffRef.current = true
    void dispatch(refreshInvestorDashboard())
  }, [dispatch, status, accessToken])

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
