import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import DashboardSessionGuard from '@/components/session/DashboardSessionGuard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import { refreshMerchantDashboard } from '@/store/slices/merchantDashboardSlice'
import { refreshMerchantReceivables } from '@/store/slices/merchantReceivablesSlice'
import { refreshMerchantTransactions } from '@/store/slices/merchantTransactionsSlice'

export default function MerchantDashboardSessionLayout() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const role = useAppSelector((s) => s.auth.role)
  const status = useAppSelector((s) => s.merchantDashboard.status)
  const error = useAppSelector((s) => s.merchantDashboard.error)
  const isKycVerified = useAppSelector(selectIsKycVerified)
  const [errorOpen, setErrorOpen] = useState(false)
  const didKickoffRef = useRef(false)

  useEffect(() => {
    didKickoffRef.current = false
  }, [accessToken, role])

  useEffect(() => {
    if (didKickoffRef.current) return
    if (status !== 'idle') return
    if (!accessToken?.trim()) return
    if (role !== 'merchant') return
    didKickoffRef.current = true
    void dispatch(refreshMerchantDashboard())
  }, [dispatch, status, accessToken, role])

  useEffect(() => {
    if (!didKickoffRef.current) return
    if (!isKycVerified) return
    // Once KYC becomes verified, hydrate dependent dashboard sections.
    void dispatch(refreshMerchantReceivables())
    void dispatch(refreshMerchantTransactions())
  }, [dispatch, isKycVerified])

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
        onRetry={() => void dispatch(refreshMerchantDashboard())}
      />
      {status === 'loading' ? (
        <div className="fixed inset-0 z-75">
          <DashboardFullPageLoading label="Syncing merchant dashboard…" />
        </div>
      ) : null}
      <Outlet />
    </>
  )
}
