import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
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
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)
  const didKickoffRef = useRef(false)

  useEffect(() => {
    didKickoffRef.current = false
    setErrorDismissed(false)
    setLoadingDismissed(false)
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
    if (!accessToken?.trim()) return
    if (role !== 'merchant') return
    void dispatch(refreshMerchantReceivables())
  }, [dispatch, accessToken, role])

  useEffect(() => {
    if (!didKickoffRef.current) return
    if (!isKycVerified) return
    void dispatch(refreshMerchantTransactions())
  }, [dispatch, isKycVerified])

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
        loadingTitle="Syncing merchant dashboard"
        loadingDescription="Fetching the latest data for your account…"
        errorTitle="Unable to load dashboard"
        errorDescription={error ?? undefined}
        onDismiss={() => setErrorDismissed(true)}
        onRetry={() => {
          setErrorDismissed(false)
          void dispatch(refreshMerchantDashboard())
        }}
        onCancelLoading={() => setLoadingDismissed(true)}
      />
      <Outlet />
    </>
  )
}
