import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { MERCHANT_RECEIVABLES_ROWS } from '@/components/dashboard/merchant/receivables/merchantReceivablesConfig'

import arbitrumLogo from '@/assets/arbitrum_icon.jpeg.png'
import backArrowIcon from '@/assets/ph_arrow-left.png'

const walletDisplay = '0x7A3F...92C1'

const REPAY_TABS = ['Amount', 'Review', 'Done'] as const

type RepayConfirmLocationState = {
  paymentAmount?: number
}

const MerchantRepayLoanConfirmationPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const state = (location.state ?? {}) as RepayConfirmLocationState
  const paymentAmount = state.paymentAmount ?? 12500

  const selectedRow = useMemo(
    () => (receivableId ? MERCHANT_RECEIVABLES_ROWS.find((r) => r.id === receivableId) ?? null : null),
    [receivableId]
  )

  if (!receivableId || !selectedRow) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
    { label: 'View Receivable', to: `/dashboard/merchant/receivables/${receivableId}` },
    { label: 'Repay Loan' },
  ]

  // Demo values to match the confirmation layout.
  const youWillReceive = paymentAmount
  const aprLine = '4.6% APR'

  const principalDue = '$10,000.00'
  const interestDue = '$2,000.00'
  const lateFeesDue = '$500.00'
  const platformFeePercent = '12.8%'
  const totalPayment = '$640.00'

  const warningText =
    'Funds will be locked for the loan duration (30–90 days). Early withdrawal may incur penalties. Smart contract interactions are irreversible.'

  const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EDF0F4]">
      <span className="text-[#6B7488] text-[12px]">{label}</span>
      <span className="text-[#0B1220] text-[12px] font-medium">{value}</span>
    </div>
  )

  const ReviewKeyValue = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EDF0F4]">
      <span className="text-[#6B7488] text-[12px]">{label}</span>
      <span className="text-[#0B1220] text-[12px] font-medium text-right">{value}</span>
    </div>
  )

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="max-w-[860px] w-full mx-auto pt-8 pb-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#6B7488] text-[16px] leading-[20px] hover:underline"
          >
            <img src={backArrowIcon} alt="" className="h-[20px] w-[20px] object-contain" />
            <span>Back</span>
          </button>
        </div>

        <div>
          <h1 className="text-[#0B1220] font-bold text-[20px] leading-tight">Review Repayment</h1>
          <p className="text-[#6B7488] text-[12px] mt-1">Review your details before proceeding.</p>
        </div>

        <div className="w-full lg:hidden">
          <div className="w-full rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
            <div className="grid grid-cols-3">
              {REPAY_TABS.map((label, idx) => {
                const activeIndex = 1
                const isActive = idx === activeIndex
                const isClickable = idx <= activeIndex
                const onTabClick = () => {
                  if (!isClickable) return
                  if (idx === 0) {
                    navigate(`/dashboard/merchant/receivables/${receivableId}/repay`)
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

        <section className="rounded-[10px] border border-[#DFE2E8] bg-white flex flex-col overflow-hidden">
          <div className="bg-linear-to-r from-[#2A6CC8] to-[#73A4E7] px-6 py-5 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-white font-semibold text-[16px] truncate">{selectedRow.receivableName}</p>
              <p className="text-white/90 text-[12px] mt-1">Moderate risk, Moderate returns.</p>
            </div>
            <div className="rounded-[8px] bg-white/15 border border-white/20 px-4 py-3 min-w-[180px] text-right shrink-0">
              <p className="text-white/80 text-[10px]">You'll receive</p>
              <p className="text-white font-bold text-[28px] leading-none mt-1">${youWillReceive.toLocaleString()}</p>
              <p className="text-white/80 text-[10px] mt-2">{aprLine}</p>
            </div>
          </div>

          <div className="px-6 py-2 flex-1">
            <ReviewRow label="Principal Due" value={principalDue} />
            <ReviewRow label="Interest Due" value={interestDue} />
            <ReviewRow label="Late Fees (if any)" value={lateFeesDue} />
            <ReviewKeyValue label="Platform fee" value={platformFeePercent} />
            <ReviewKeyValue label="Total Payment" value={totalPayment} />
            <ReviewKeyValue label="Connected Wallet Address" value={walletDisplay} />
            <ReviewKeyValue label="Lending Pool" value="Fist Commerce" />

            <div className="mt-4 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex items-start gap-3">
              <span className="text-[#F59E0B] text-[14px] leading-none" aria-hidden>
                ⚠
              </span>
              <p className="text-[#DC2626] text-[12px] leading-relaxed">{warningText}</p>
            </div>
          </div>

          <div className="mt-auto px-6 py-4 border-t border-[#EDF0F4] bg-white">
            <button
              type="button"
              className="w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors"
              onClick={() =>
                navigate(`/dashboard/merchant/receivables/${receivableId}/repay/success`, {
                  state: { paymentAmount },
                })
              }
            >
              Repay Loan
            </button>

            {/* wallet icon preview (hidden, used to force bundler include) */}
            <img src={arbitrumLogo} alt="" className="hidden" />
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default MerchantRepayLoanConfirmationPage

