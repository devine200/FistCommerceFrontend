import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ApiRequestError, toUserFacingError } from '@/api/client'
import { canNavigateToLoanDetail, fetchLoanDetails } from '@/api/loanDetails'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import MerchantReceivableDetailContent from '@/components/dashboard/merchant/receivables/MerchantReceivableDetailContent'
import { getReceivableDetailById } from '@/components/dashboard/merchant/receivables/receivableDetailConfig'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import { mapLoanDetailsToReceivableDetailView } from '@/utils/mapLoanDetailsToReceivableDetailView'
import { resolveMerchantReceivableRepayState } from '@/utils/merchantReceivableRepayEligibility'

type ReceivableDetailLocationState = {
  poolSlug?: string
}

const walletDisplay = '0x7A3F...92C1'

function loanDetailsErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError && error.status === 404) {
    return 'This loan request was not found. The link may be invalid or you may not have access.'
  }
  return toUserFacingError(error, 'Could not load receivable details.')
}

const MerchantReceivableDetailPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)

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
      const api = await fetchLoanDetails(token, loanId)
      const repayState = await resolveMerchantReceivableRepayState(token, api)
      return { api, repayState }
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
    return mapLoanDetailsToReceivableDetailView(
      loanId,
      loanDetailsQuery.data.api,
      loanDetailsQuery.data.repayState,
    )
  }, [loanDetailsQuery.data, loanId])

  const resolvedDetail = detail ?? (!fetchFromApi ? demoOnlyDetail : null)

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = useMemo(
    () => [
      { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
      { label: 'View Receivable' },
    ],
    [],
  )

  const feedbackPhase =
    fetchFromApi && loanDetailsQuery.isLoading && !loadingDismissed
      ? 'loading'
      : fetchFromApi && loanDetailsQuery.isError && !errorDismissed
        ? 'failed'
        : 'idle'

  if (!loanId) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  if (!token) {
    return <Navigate to="/onboarding/merchant/connect-wallet" replace />
  }

  if (!resolvedDetail && !fetchFromApi) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
      topBarNotificationUnread
    >
      <DashboardRequestFeedbackLayer
        phase={feedbackPhase}
        loadingTitle="Loading receivable details"
        loadingDescription="Fetching loan and repayment information…"
        errorTitle="Unable to load receivable"
        errorDescription={
          loanDetailsQuery.error ? loanDetailsErrorMessage(loanDetailsQuery.error) : undefined
        }
        onDismiss={() => {
          setErrorDismissed(true)
          navigate(poolDetailPath, { replace: true })
        }}
        onRetry={() => {
          setErrorDismissed(false)
          void loanDetailsQuery.refetch()
        }}
        onCancelLoading={() => setLoadingDismissed(true)}
        cancelLabel="Go back"
      />
      {resolvedDetail ? <MerchantReceivableDetailContent detail={resolvedDetail} /> : null}
    </DashboardLayout>
  )
}

export default MerchantReceivableDetailPage
