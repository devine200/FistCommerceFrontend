import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { MERCHANT_RECEIVABLES_ROWS } from '@/components/dashboard/merchant/receivables/merchantReceivablesConfig'

import arbitrumLogo from '@/assets/arbitrum_icon.jpeg.png'
const QUICK_AMOUNTS = [500, 1000, 2500, 5000]
const walletDisplay = '0x7A3F...92C1'

const REPAY_TABS = ['Amount', 'Review', 'Done'] as const

const MerchantRepayLoanPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const navigate = useNavigate()

  const selectedRow = useMemo(
    () => MERCHANT_RECEIVABLES_ROWS.find((r) => r.id === receivableId) ?? null,
    [receivableId]
  )

  const [amount, setAmount] = useState(0)

  if (!selectedRow || !receivableId) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
    { label: 'View Receivable', to: `/dashboard/merchant/receivables/${receivableId}` },
    { label: 'Repay Loan' },
  ]

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <div className="max-w-[820px] w-full mx-auto pt-8 pb-6 flex flex-col gap-6">
        <div>
          <h1 className="text-[#0B1220] font-bold text-[28px] leading-tight">Repay Loan</h1>
          <p className="text-[#6B7488] text-[16px] mt-1.5">
            Make a repayment toward your outstanding loan balance.
          </p>
        </div>

        <div className="w-full lg:hidden">
          <div className="w-full rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
            <div className="grid grid-cols-3">
              {REPAY_TABS.map((label, idx) => {
                const isActive = idx === 0
                const isClickable = idx <= 0
                return (
                  <button
                    key={label}
                    type="button"
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

        <section className="rounded-[10px] border border-[#DFE2E8] bg-white p-6">
          <p className="text-[#6B7488] text-[14px] text-center">Amount</p>
          <p className="text-[#667085] text-[64px] leading-none font-semibold text-center mt-3">${amount}</p>

          <div className="flex justify-center flex-wrap gap-3 mt-5">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`min-w-[72px] rounded-[4px] px-3 py-2 text-[13px] border ${
                  amount === v
                    ? 'border-[#195EBC] bg-[#E8EFFB] text-[#195EBC]'
                    : 'border-[#E6E8EC] bg-[#F8FAFC] text-[#8B92A3]'
                }`}
              >
                ${v.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-3">
              <span className="text-[#6B7488] text-[22px]">Wallet:</span>
              <div className="h-[46px] rounded-[6px] border border-[#D9DEE8] bg-white px-4 flex items-center gap-3">
                <span className="text-[#0B1220] text-[19px] font-semibold">{walletDisplay}</span>
                <span className="h-5 w-px bg-[#E6E8EC]" />
                <img src={arbitrumLogo} alt="Arbitrum logo" className="h-5 w-5 rounded-[4px] object-cover" />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-8 w-full rounded-[6px] bg-[#195EBC] text-white text-[18px] font-medium h-[50px] hover:bg-[#154a9a] transition-colors"
            onClick={() => {
              const paymentAmount = amount > 0 ? amount : 2500
              navigate(`/dashboard/merchant/receivables/${receivableId}/repay/confirm`, {
                state: { paymentAmount },
              })
            }}
          >
            Continue
          </button>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default MerchantRepayLoanPage

