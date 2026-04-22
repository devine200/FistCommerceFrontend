import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { resolveInvestorPoolLayoutMeta } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailFromMetrics'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import InvestorInvestCard from '@/components/dashboard/investor/invest/InvestorInvestCard'
import InvestorWithdrawFlow from '@/components/dashboard/investor/withdraw/InvestorWithdrawFlow'
import { useAppSelector } from '@/store/hooks'
import { WithdrawalStep } from '@/components/dashboard/investor/withdraw/types'
import { InvestmentStep } from '@/components/dashboard/investor/invest/types'

const WITHDRAW_TABS: Array<{ key: WithdrawalStep; label: string }> = [
  { key: WithdrawalStep.AmountEntry, label: 'Amount' },
  { key: WithdrawalStep.MethodConfirmation, label: 'Receivable' },
  { key: WithdrawalStep.FinalConfirmation, label: 'Review' },
  { key: WithdrawalStep.WithdrawalCompleted, label: 'Done' },
]

const INVEST_TABS: Array<{ key: InvestmentStep; label: string }> = [
  { key: InvestmentStep.AmountEntry, label: 'Amount' },
  { key: InvestmentStep.PoolSelection, label: 'Receivable' },
  { key: InvestmentStep.InvestmentConfirmation, label: 'Review' },
  { key: InvestmentStep.InvestmentCompleted, label: 'Done' },
]

const getWithdrawTabIndex = (step: WithdrawalStep) => WITHDRAW_TABS.findIndex((t) => t.key === step)
const getInvestTabIndex = (step: InvestmentStep) => INVEST_TABS.findIndex((t) => t.key === step)

const InvestorInvestWithdrawPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const walletAddress = useAppSelector((s) => s.wallet.address)
  const walletDisplayFallback = useAppSelector((s) => s.investorDashboard.walletDisplay)

  const layout = useMemo(
    () => resolveInvestorPoolLayoutMeta(poolSlug, lendingPool, walletAddress, walletDisplayFallback),
    [poolSlug, lendingPool, walletAddress, walletDisplayFallback],
  )

  const isWithdrawMode = pathname.endsWith('/withdraw')
  const pageTitle = isWithdrawMode ? 'Withdrawal Request' : 'Invest Funds'
  const pageSubtitle = isWithdrawMode
    ? 'Withdraw capital or earnings from your lending pool position'
    : 'Deploy capital into a lending pool and start earning yield.'

  if (!layout.ok || !poolSlug) {
    return <Navigate to="/dashboard/investor/overview" replace />
  }

  const [withdrawStep, setWithdrawStep] = useState<WithdrawalStep>(WithdrawalStep.AmountEntry)
  const withdrawActiveIndex = useMemo(() => getWithdrawTabIndex(withdrawStep), [withdrawStep])
  const [investStep, setInvestStep] = useState<InvestmentStep>(InvestmentStep.AmountEntry)
  const investActiveIndex = useMemo(() => getInvestTabIndex(investStep), [investStep])

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Explore Lending Pools', to: '/dashboard/investor/overview' },
    { label: 'Lending Pool', to: `/dashboard/investor/lending-pool/${poolSlug}` },
    { label: 'Invest/Withdraw' },
  ]

  const tb = layout.topBar

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/investor"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarBreadcrumbLinksMuted={Boolean(tb)}
      topBarWalletDisplay={tb?.walletDisplay}
      topBarNotificationUnread={tb?.showUnreadNotification ?? false}
    >
      <div className="max-w-[980px] w-full mx-auto pt-4 sm:pt-6 lg:pt-8 pb-6 flex flex-col gap-4 sm:gap-6">
        {isWithdrawMode ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[#6B7488] text-[13px] inline-flex items-center gap-2 hover:text-[#195EBC]"
            >
              <span aria-hidden>←</span>
              Back
            </button>
          </div>
        ) : null}

        <div>
          <h1 className="text-[#0B1220] font-bold text-[20px] sm:text-[28px] lg:text-[34px] leading-tight">
            {isWithdrawMode ? 'Withdraw Funds' : pageTitle}
          </h1>
          <p className="text-[#6B7488] text-[13px] sm:text-[16px] mt-1.5">{pageSubtitle}</p>
        </div>

        <div className="w-full lg:hidden">
          <div
            className={`w-full rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden ${
              (isWithdrawMode && withdrawStep === WithdrawalStep.FlowFailure) ||
              (!isWithdrawMode && investStep === InvestmentStep.FlowFailure)
                ? 'hidden'
                : ''
            }`}
          >
            <div className="grid grid-cols-4">
              {(isWithdrawMode ? WITHDRAW_TABS : INVEST_TABS).map((tab, idx) => {
                const activeIndex = isWithdrawMode ? withdrawActiveIndex : investActiveIndex
                const isActive = idx === activeIndex
                const isClickable = idx <= activeIndex
                const onClick = () => {
                  if (!isClickable) return
                  if (isWithdrawMode) {
                    setWithdrawStep(tab.key as WithdrawalStep)
                    return
                  }
                  setInvestStep(tab.key as InvestmentStep)
                }

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={onClick}
                    disabled={!isClickable}
                    className={[
                      'py-3 text-center text-[13px] font-medium border-r last:border-r-0 disabled:cursor-not-allowed',
                      isActive ? 'bg-[#195EBC] text-white' : 'bg-white text-[#6B7488]',
                    ].join(' ')}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {isWithdrawMode ? (
          <InvestorWithdrawFlow walletDisplay={tb?.walletDisplay} step={withdrawStep} onStepChange={setWithdrawStep} />
        ) : (
          <InvestorInvestCard walletDisplay={tb?.walletDisplay} step={investStep} onStepChange={setInvestStep} />
        )}
      </div>
    </DashboardLayout>
  )
}

export default InvestorInvestWithdrawPage
