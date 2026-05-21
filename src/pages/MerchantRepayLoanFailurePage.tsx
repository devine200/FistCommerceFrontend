import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { canNavigateToLoanDetail } from '@/api/loanDetails'
import {
  MERCHANT_REPAY_DEFAULT_FAILURE_MESSAGE,
  merchantRepayBreadcrumbs,
  merchantRepayPaths,
} from '@/components/dashboard/merchant/repay/repayFlowConfig'
import type { MerchantRepayLocationState } from '@/hooks/useMerchantRepayLoanContext'
import DashboardLayout from '@/layouts/DashboardLayout'

import failureIllustration from '@/assets/case.png'

const MerchantRepayLoanFailurePage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const loanId = receivableId?.trim() ?? ''
  const state = (location.state ?? {}) as MerchantRepayLocationState
  const paymentAmount = state.paymentAmount ?? 0

  const paths = useMemo(() => merchantRepayPaths(loanId), [loanId])
  const breadcrumbs = useMemo(() => merchantRepayBreadcrumbs(loanId), [loanId])

  const failureMessage =
    state.message?.trim() || MERCHANT_REPAY_DEFAULT_FAILURE_MESSAGE

  if (!loanId || !canNavigateToLoanDetail(loanId)) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  if (paymentAmount <= 0) {
    return <Navigate to={paths.amount} replace />
  }

  const retryState: MerchantRepayLocationState = {
    receivableName: state.receivableName,
    paymentAmount,
  }

  return (
    <DashboardLayout dashboardBasePath="/dashboard/merchant" topBarBreadcrumbs={breadcrumbs}>
      <div className="max-w-[820px] w-full mx-auto pt-8 pb-6 flex flex-col gap-6">
        <section className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center text-center">
          <img
            src={failureIllustration}
            alt=""
            className="h-[72px] w-[72px] object-contain"
            draggable={false}
          />
          <h1 className="mt-6 text-[#991B1B] font-bold text-[22px] leading-tight">
            Repayment could not be completed
          </h1>
          <p className="mt-3 max-w-[560px] text-[#7F1D1D] text-[14px] leading-relaxed whitespace-pre-wrap">
            {failureMessage}
          </p>
        </section>

        <section className="rounded-[10px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate(paths.confirm, { state: retryState, replace: true })}
              className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate(paths.detail, { replace: true })}
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

export default MerchantRepayLoanFailurePage
