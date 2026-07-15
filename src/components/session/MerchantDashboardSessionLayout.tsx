import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import DashboardSessionGuard from '@/components/session/DashboardSessionGuard'
import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import { refreshMerchantDashboard } from '@/store/slices/merchantDashboardSlice'
import { refreshMerchantReceivables } from '@/store/slices/merchantReceivablesSlice'

export default function MerchantDashboardSessionLayout() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const role = useAppSelector((s) => s.auth.role)
  const status = useAppSelector((s) => s.merchantDashboard.status)
  const error = useAppSelector((s) => s.merchantDashboard.error)
  const kycVerified = useAppSelector(selectIsKycVerified)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)
  const didKickoffRef = useRef(false)
  const didReceivablesRef = useRef(false)

  useEffect(() => {
    didKickoffRef.current = false
    didReceivablesRef.current = false
    setErrorDismissed(false)
    setLoadingDismissed(false)
  }, [accessToken, role])

  useEffect(() => {
    if (didKickoffRef.current) return
    if (status !== 'idle') return
    if (!isUsableApiAccessToken(accessToken)) return
    if (role !== 'merchant') return
    didKickoffRef.current = true
    void dispatch(refreshMerchantDashboard())
  }, [dispatch, status, accessToken, role])

  // After dashboard/KYC hydration: only fully verified merchants load GET /api/loan/request.
  useEffect(() => {
    if (!didKickoffRef.current) return
    if (!isUsableApiAccessToken(accessToken)) return
    if (role !== 'merchant') return
    if (status !== 'succeeded' && status !== 'failed') return
    if (!kycVerified) return
    if (didReceivablesRef.current) return
    didReceivablesRef.current = true
    void dispatch(refreshMerchantReceivables())
  }, [dispatch, accessToken, role, status, kycVerified])

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
          didReceivablesRef.current = false
          void dispatch(refreshMerchantDashboard())
        }}
        onCancelLoading={() => setLoadingDismissed(true)}
      />
      <Outlet />
    </>
  )
}
