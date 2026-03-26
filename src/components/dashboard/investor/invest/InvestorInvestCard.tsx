import { useState } from 'react'
import {
  buildInvestmentCompletedMetrics,
  buildInvestmentReviewRows,
  INVEST_DEFAULT_AMOUNT,
  INVESTMENT_POOL,
  INVESTMENT_TERMS_LABEL,
  INVESTMENT_WARNING,
  INVEST_QUICK_AMOUNTS,
} from '@/components/dashboard/investor/invest/config'
import InvestmentAmountStep from '@/components/dashboard/investor/invest/steps/InvestmentAmountStep'
import InvestmentCompletedStep from '@/components/dashboard/investor/invest/steps/InvestmentCompletedStep'
import InvestmentConfirmationStep from '@/components/dashboard/investor/invest/steps/InvestmentConfirmationStep'
import InvestmentPoolSelectionStep from '@/components/dashboard/investor/invest/steps/InvestmentPoolSelectionStep'
import { InvestmentStep } from '@/components/dashboard/investor/invest/types'
import { useParams } from 'react-router-dom'

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
  const displayAmount = amount > 0 ? amount : INVEST_DEFAULT_AMOUNT
  const resolvedPoolSlug = poolSlug ?? 'fist-commerce-lending-pool'

  const setStep = (next: InvestmentStep) => {
    onStepChange?.(next)
    if (step === undefined) setInternalStep(next)
  }

  const renderInvestmentStep = () => {
    switch (currentStep) {
      case InvestmentStep.InvestmentConfirmation:
        return (
          <InvestmentConfirmationStep
            amount={displayAmount}
            warningText={INVESTMENT_WARNING}
            reviewRows={buildInvestmentReviewRows(displayAmount)}
            onInvest={() => setStep(InvestmentStep.InvestmentCompleted)}
          />
        )

      case InvestmentStep.InvestmentCompleted:
        return (
          <InvestmentCompletedStep
            amount={displayAmount}
            poolName={INVESTMENT_POOL.name}
            metrics={buildInvestmentCompletedMetrics(displayAmount)}
            backToDashboardTo="/dashboard/investor/overview"
            viewPoolDetailsTo={`/dashboard/investor/lending-pool/${resolvedPoolSlug}`}
          />
        )

      case InvestmentStep.PoolSelection:
        return (
          <InvestmentPoolSelectionStep
            displayAmount={displayAmount}
            pool={INVESTMENT_POOL}
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
