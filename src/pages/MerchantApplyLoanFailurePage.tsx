import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import failureIllustration from '@/assets/case.png'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { clearMerchantLoanApplyDraft } from '@/session/merchantLoanApplyDraft'

const walletDisplay = '0x7A3F...92C1'

type FailureLocationState = {
  message?: string
}

const MerchantApplyLoanFailurePage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const failureMessage =
    (location.state as FailureLocationState | null)?.message?.trim() ||
    'We could not submit your loan request. Please try again.'

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = useMemo(
    () => [
      { label: 'Explore Lending Pools', to: '/dashboard/merchant/overview' },
      { label: 'Lending Pool', to: poolSlug ? `/dashboard/merchant/lending-pool/${poolSlug}` : undefined },
      { label: 'Apply for Loan' },
    ],
    [poolSlug],
  )

  if (!poolSlug) {
    return <Navigate to="/dashboard/merchant/overview" replace />
  }

  const poolDetailPath = `/dashboard/merchant/lending-pool/${poolSlug}`
  const applyLoanPath = `/dashboard/merchant/lending-pool/${poolSlug}/apply-loan`

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="max-w-[820px] w-full mx-auto pt-10 pb-10 flex flex-col gap-6">
        <section className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center text-center">
          <img
            src={failureIllustration}
            alt=""
            className="h-[72px] w-[72px] object-contain"
            draggable={false}
          />
          <h1 className="mt-6 text-[#991B1B] font-bold text-[22px] leading-tight">
            Loan request could not be submitted
          </h1>
          <p className="mt-3 max-w-[560px] text-[#7F1D1D] text-[14px] leading-relaxed whitespace-pre-wrap">
            {failureMessage}
          </p>
        </section>

        <section className="rounded-[10px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                navigate(applyLoanPath, { state: { restoreDraft: true }, replace: true })
              }}
              className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                clearMerchantLoanApplyDraft()
                navigate(poolDetailPath, { replace: true })
              }}
              className="h-[46px] rounded-[4px] bg-[#EEF2F6] text-[#195EBC] text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#E5ECF4] transition-colors"
            >
              Cancel
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default MerchantApplyLoanFailurePage
