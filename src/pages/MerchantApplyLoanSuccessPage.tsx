import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { MERCHANT_RECEIVABLES_ROWS } from '@/components/dashboard/merchant/receivables/merchantReceivablesConfig'

import completionIllustration from '@/assets/apply-loan-success.png'

const walletDisplay = '0x7A3F...92C1'

const MerchantApplyLoanSuccessPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = useMemo(
    () => [{ label: 'All Receivables', to: '/dashboard/merchant/receivables' }],
    []
  )

  const firstReceivableId = MERCHANT_RECEIVABLES_ROWS[0]?.id

  if (!poolSlug) {
    return <Navigate to="/dashboard/merchant/overview" replace />
  }

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="max-w-[820px] w-full mx-auto pt-10 pb-10 flex flex-col gap-6">
        <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center text-center">
          <img src={completionIllustration} alt="" className="h-[62px] w-[62px] object-contain" draggable={false} />

          <h1 className="mt-6 text-[#0B1220] font-bold text-[22px] leading-tight">
            Your Receivable has been Created
          </h1>
          <p className="mt-2 max-w-[560px] text-[#6B7488] text-[12px] leading-relaxed">
            Be on the lookout we will inform you when your receivable has been verified and funded.
          </p>
        </section>

        <section className="rounded-[10px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/dashboard/merchant/overview"
              className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
            >
              Back to Dashboard
            </Link>

            <Link
              to={firstReceivableId ? `/dashboard/merchant/receivables/${firstReceivableId}` : '/dashboard/merchant/receivables'}
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

export default MerchantApplyLoanSuccessPage

