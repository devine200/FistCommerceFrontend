import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  buildInvestmentCompletedMetrics,
  buildInvestmentReviewRows,
  buildLiveInvestmentPoolInfo,
  formatInvestAmountUsd,
  INVESTMENT_TERMS_LABEL,
  INVESTMENT_WARNING,
  INVEST_QUICK_AMOUNTS,
} from '@/components/dashboard/investor/invest/config'
import InvestmentAmountStep from '@/components/dashboard/investor/invest/steps/InvestmentAmountStep'
import InvestmentCompletedStep from '@/components/dashboard/investor/invest/steps/InvestmentCompletedStep'
import InvestmentConfirmationStep from '@/components/dashboard/investor/invest/steps/InvestmentConfirmationStep'
import InvestmentPoolSelectionStep from '@/components/dashboard/investor/invest/steps/InvestmentPoolSelectionStep'
import { InvestmentStep } from '@/components/dashboard/investor/invest/types'
import { useAppSelector } from '@/store/hooks'

interface InvestorInvestCardProps {
  walletDisplay?: string
  step?: InvestmentStep
  onStepChange?: (step: InvestmentStep) => void
}

const InvestorInvestCard = ({ walletDisplay, step, onStepChange }: InvestorInvestCardProps) => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const [amount, setAmount] = useState(0)
  const [internalStep, setInternalStep] = useState<InvestmentStep>(InvestmentStep.AmountEntry)
  const currentStep = step ?? internalStep
  const displayAmount = amount
  const amountDisplay = formatInvestAmountUsd(displayAmount)
  const resolvedPoolSlug = poolSlug ?? 'fist-commerce-lending-pool'

  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const poolMetrics = useAppSelector((s) => s.investorDashboard.poolMetrics)
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)

  const poolInfo = useMemo(
    () => buildLiveInvestmentPoolInfo(lendingPool.poolTitle, poolMetrics),
    [lendingPool.poolTitle, poolMetrics],
  )

  const setStep = (next: InvestmentStep) => {
    onStepChange?.(next)
    if (step === undefined) setInternalStep(next)
  }

  const renderInvestmentStep = () => {
    switch (currentStep) {
      case InvestmentStep.InvestmentConfirmation:
        return (
          <InvestmentConfirmationStep
            amountDisplay={amountDisplay}
            warningText={INVESTMENT_WARNING}
            reviewRows={buildInvestmentReviewRows(
              displayAmount,
              poolInfo.name,
              poolMetrics,
              investorMetrics,
            )}
            onInvest={() => setStep(InvestmentStep.InvestmentCompleted)}
          />
        )

      case InvestmentStep.InvestmentCompleted:
        return (
          <InvestmentCompletedStep
            amountDisplay={amountDisplay}
            poolName={poolInfo.name}
            metrics={buildInvestmentCompletedMetrics(displayAmount, poolMetrics, investorMetrics)}
            backToDashboardTo="/dashboard/investor/overview"
            viewPoolDetailsTo={`/dashboard/investor/lending-pool/${resolvedPoolSlug}`}
          />
        )

      case InvestmentStep.PoolSelection:
        return (
          <InvestmentPoolSelectionStep
            amountDisplay={amountDisplay}
            pool={poolInfo}
            detailsLabel={INVESTMENT_TERMS_LABEL}
            onContinue={() => setStep(InvestmentStep.InvestmentConfirmation)}
          />
        )

      case InvestmentStep.AmountEntry:
      default:
        return (
          <InvestmentAmountStep
            amount={amount}
            walletDisplay={walletDisplay ?? '0x7A3F...92C1'}
            quickAmounts={INVEST_QUICK_AMOUNTS}
            onAmountSelect={setAmount}
            onContinue={() => setStep(InvestmentStep.PoolSelection)}
          />
        )
    }
  }

  return (
    <>{renderInvestmentStep()}</>
  )
}

export default InvestorInvestCard
