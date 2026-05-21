import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ApiRequestError } from '@/api/client'
import { canNavigateToLoanDetail, fetchLoanDetails } from '@/api/loanDetails'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import MerchantReceivableDetailContent from '@/components/dashboard/merchant/receivables/MerchantReceivableDetailContent'
import { getReceivableDetailById } from '@/components/dashboard/merchant/receivables/receivableDetailConfig'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import { mapLoanDetailsToReceivableDetailView } from '@/utils/mapLoanDetailsToReceivableDetailView'

type ReceivableDetailLocationState = {
  poolSlug?: string
}

const walletDisplay = '0x7A3F...92C1'

const MerchantReceivableDetailPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAppSelector((s) => s.auth.accessToken)

  const poolSlug = (location.state as ReceivableDetailLocationState | null)?.poolSlug?.trim() ?? ''
  const poolDetailPath = poolSlug
    ? `/dashboard/merchant/lending-pool/${poolSlug}`
    : '/dashboard/merchant/overview'

  const token = accessToken?.trim() ?? ''
  const loanId = receivableId?.trim() ?? ''
  const demoOnlyDetail = useMemo(
    () => (loanId ? getReceivableDetailById(loanId) : null),
    [loanId],
  )
  const fetchFromApi = Boolean(loanId && token && canNavigateToLoanDetail(loanId) && !demoOnlyDetail)

  const loanDetailsQuery = useQuery({
    queryKey: ['loan-details', loanId, token],
    queryFn: async () => {
      if (!token) throw new Error('Missing session token.')
      return await fetchLoanDetails(token, loanId)
    },
    enabled: Boolean(loanId && token && fetchFromApi),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })

  const detail = useMemo(() => {
    if (!loanDetailsQuery.data || !loanId) return null
    return mapLoanDetailsToReceivableDetailView(loanId, loanDetailsQuery.data)
  }, [loanDetailsQuery.data, loanId])

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = useMemo(
    () => [
      { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
      { label: 'View Receivable' },
    ],
    [],
  )

  if (!loanId) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  if (!token) {
    return <Navigate to="/onboarding/merchant/connect-wallet" replace />
  }

  if (fetchFromApi && loanDetailsQuery.isLoading) {
    return (
      <DashboardLayout
        dashboardBasePath="/dashboard/merchant"
        topBarBreadcrumbs={topBarBreadcrumbs}
        topBarWalletDisplay={walletDisplay}
        topBarNotificationUnread
      >
        <DashboardFullPageLoading label="Loading receivable details…" />
      </DashboardLayout>
    )
  }

  if (fetchFromApi && loanDetailsQuery.isError) {
    const err = loanDetailsQuery.error
    const message =
      err instanceof ApiRequestError
        ? err.status === 404
          ? 'This loan request was not found. The link may be invalid or you may not have access.'
          : err.message
        : err instanceof Error
          ? err.message
          : 'Could not load receivable details.'

    return (
      <DashboardLayout
        dashboardBasePath="/dashboard/merchant"
        topBarBreadcrumbs={topBarBreadcrumbs}
        topBarWalletDisplay={walletDisplay}
        topBarNotificationUnread
      >
        <div className="max-w-[640px] mx-auto py-12 px-4">
          <section className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center">
            <h1 className="text-[#991B1B] font-bold text-[20px]">Unable to load receivable</h1>
            <p className="mt-3 text-[#7F1D1D] text-[14px] leading-relaxed">{message}</p>
          </section>
          <button
            type="button"
            onClick={() => navigate(poolDetailPath, { replace: true })}
            className="mt-6 w-full h-[46px] rounded-[6px] bg-[#195EBC] text-white text-[15px] font-medium hover:bg-[#154a9a] transition-colors"
          >
            Back to lending pool
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!detail) {
    if (!fetchFromApi && demoOnlyDetail) {
      return (
        <DashboardLayout
          dashboardBasePath="/dashboard/merchant"
          topBarBreadcrumbs={topBarBreadcrumbs}
          topBarWalletDisplay={walletDisplay}
          topBarNotificationUnread
        >
          <MerchantReceivableDetailContent detail={demoOnlyDetail} />
        </DashboardLayout>
      )
    }
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
      topBarNotificationUnread
    >
      <MerchantReceivableDetailContent detail={detail} />
    </DashboardLayout>
  )
}

export default MerchantReceivableDetailPage
