import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminDashboard } from '@/store/slices/adminDashboardSlice'

export default function AdminDashboardSessionLayout() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const status = useAppSelector((s) => s.adminDashboard.status)
  const didKickoffRef = useRef(false)

  useEffect(() => {
    didKickoffRef.current = false
  }, [accessToken, sessionKind])

  useEffect(() => {
    if (didKickoffRef.current) return
    if (status !== 'idle') return
    if (!accessToken?.trim()) return
    if (sessionKind !== 'admin') return
    didKickoffRef.current = true
    void dispatch(refreshAdminDashboard())
  }, [dispatch, status, accessToken, sessionKind])

  return (
    <>
      {status === 'loading' ? (
        <div className="fixed inset-0 z-75">
          <DashboardFullPageLoading label="Syncing platform overview…" />
        </div>
      ) : null}
      <Outlet />
    </>
  )
}
