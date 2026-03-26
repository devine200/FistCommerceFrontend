import { useMemo } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'

import kycPendingIllustration from '@/assets/kyc-inprogress.png'

const walletDisplay = '0x7A3F...92C1'

const REPAY_TABS = ['Amount', 'Review', 'Done'] as const

type MerchantRepaySuccessLocationState = {
  paymentAmount?: number
}

const MerchantRepayLoanSuccessPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const state = (location.state ?? {}) as MerchantRepaySuccessLocationState
  const paymentAmount = state.paymentAmount ?? 12500

  const percentagePaid = '100%'

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = useMemo(
    () => [
      { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
      { label: 'View Receivable', to: `/dashboard/merchant/receivables/${receivableId}` },
      { label: 'Repay Loan' },
    ],
    [receivableId]
  )

  if (!receivableId) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="max-w-[820px] w-full mx-auto pt-8 pb-6 flex flex-col gap-6">
        <div className="w-full lg:hidden">
          <div className="w-full rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
            <div className="grid grid-cols-3">
              {REPAY_TABS.map((label, idx) => {
                const activeIndex = 2
                const isActive = idx === activeIndex
                const isClickable = idx <= activeIndex
                const onTabClick = () => {
                  if (!isClickable) return
                  if (idx === 0) {
                    navigate(`/dashboard/merchant/receivables/${receivableId}/repay`)
                    return
                  }
                  if (idx === 1) {
                    navigate(`/dashboard/merchant/receivables/${receivableId}/repay/confirm`, {
                      state: { paymentAmount },
                    })
                  }
                }

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={onTabClick}
                    disabled={!isClickable}
                    className={[
                      'py-3 text-center text-[13px] font-medium border-r last:border-r-0 disabled:cursor-not-allowed',
                      isActive ? 'bg-[#195EBC] text-white' : 'bg-white text-[#6B7488]',
                    ].join(' ')}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center text-center">
          <img
            src={kycPendingIllustration}
            alt=""
            className="h-[120px] w-[120px] object-contain"
            draggable={false}
          />
          <h1 className="mt-6 text-[#0B1220] font-bold text-[20px] leading-tight">Loan Payment Successful</h1>
          <p className="mt-2 max-w-[520px] text-[#6B7488] text-[12px] leading-relaxed">
            Your loan payment has been received and your loan global changes have been updated.
          </p>

          <div className="mt-6 rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-[#E6E8EC]">
              <div className="px-5 py-4">
                <p className="text-[#8B92A3] text-[12px]">Amount</p>
                <p className="text-[#0B1220] text-[15px] font-semibold mt-1">${paymentAmount.toLocaleString()}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[#8B92A3] text-[12px]">Percentage Paid</p>
                <p className="text-[#0B1220] text-[15px] font-semibold mt-1">{percentagePaid}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/dashboard/merchant/overview"
              className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              to={`/dashboard/merchant/receivables/${receivableId}`}
              className="h-[46px] rounded-[4px] bg-[#EEF2F6] text-[#195EBC] text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#E5ECF4] transition-colors"
            >
              View Receivable Details
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default MerchantRepayLoanSuccessPage

