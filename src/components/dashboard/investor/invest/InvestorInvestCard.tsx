import { useEffect, useMemo, useState } from 'react'
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
import FlowFailureStep from '@/components/dashboard/shared/FlowFailureStep'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { useAppSelector } from '@/store/hooks'
import { formatFlowFailureMessage } from '@/utils/formatFlowFailureMessage'

interface InvestorInvestCardProps {
  walletDisplay?: string
  step?: InvestmentStep
  onStepChange?: (step: InvestmentStep) => void
}

type InvestFlowFailure = {
  message: string
  returnStep: InvestmentStep
}

const InvestorInvestCard = ({ walletDisplay, step, onStepChange }: InvestorInvestCardProps) => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const [amount, setAmount] = useState(0)
  const [flowFailure, setFlowFailure] = useState<InvestFlowFailure | null>(null)
  const [investSubmitting, setInvestSubmitting] = useState(false)
  const [internalStep, setInternalStep] = useState<InvestmentStep>(InvestmentStep.AmountEntry)
  const currentStep = step ?? internalStep
  const displayAmount = amount
  const amountDisplay = formatInvestAmountUsd(displayAmount)
  const resolvedPoolSlug = poolSlug ?? 'fist-commerce-lending-pool'

  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const poolMetrics = useAppSelector((s) => s.investorDashboard.poolMetrics)
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)

  const contracts = useTestnetContracts({
    estimateDepositHumanAmount:
      currentStep === InvestmentStep.InvestmentConfirmation ? displayAmount : undefined,
  })

  const poolInfo = useMemo(
    () => buildLiveInvestmentPoolInfo(lendingPool.poolTitle, poolMetrics),
    [lendingPool.poolTitle, poolMetrics],
  )

  const setStep = (next: InvestmentStep) => {
    onStepChange?.(next)
    if (step === undefined) setInternalStep(next)
  }

  useEffect(() => {
    if (currentStep !== InvestmentStep.FlowFailure) setFlowFailure(null)
  }, [currentStep])

  const openFlowFailure = (source: unknown, returnStep: InvestmentStep) => {
    setFlowFailure({ message: formatFlowFailureMessage(source), returnStep })
    setStep(InvestmentStep.FlowFailure)
  }

  const walletMockTokenLabel = useMemo(() => {
    if (!contracts.isConnected) return 'Connect your wallet to view wallet balance (Sepolia).'
    if (contracts.isContractsLoading) return 'Loading balance…'
    const formatted = contracts.mockTokenBalanceFormatted
    const amountLine = formatted === '—' ? 'Wallet Balance: —' : `Wallet Balance: $${formatted}`
    if (!contracts.isCorrectNetwork) {
      return `${amountLine} (Sepolia contract view; switch to ${contracts.testnetChain.name} to deposit.)`
    }
    return amountLine
  }, [
    contracts.isConnected,
    contracts.isContractsLoading,
    contracts.isCorrectNetwork,
    contracts.mockTokenBalanceFormatted,
    contracts.testnetChain.name,
  ])

  const handlePoolContinue = () => {
    const gate = contracts.canDepositHuman(displayAmount)
    if (!gate.ok) {
      openFlowFailure(gate.message ?? 'Cannot continue', InvestmentStep.PoolSelection)
      return
    }
    setStep(InvestmentStep.InvestmentConfirmation)
  }

  const handleInvestConfirm = async () => {
    setInvestSubmitting(true)
    try {
      await contracts.depositFundingPool(displayAmount)
      setStep(InvestmentStep.InvestmentCompleted)
    } catch (e) {
      openFlowFailure(e, InvestmentStep.InvestmentConfirmation)
    } finally {
      setInvestSubmitting(false)
    }
  }

  const renderInvestmentStep = () => {
    switch (currentStep) {
      case InvestmentStep.FlowFailure:
        return (
          <FlowFailureStep
            message={flowFailure?.message ?? 'Something went wrong. Please try again.'}
            onPrimary={() => {
              const back = flowFailure?.returnStep ?? InvestmentStep.PoolSelection
              setFlowFailure(null)
              setStep(back)
            }}
            secondaryLabel="Change amount"
            onSecondary={() => {
              setFlowFailure(null)
              setStep(InvestmentStep.AmountEntry)
            }}
          />
        )

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
              { gasFeeEstimateDisplay: contracts.depositGasFeeLabel },
            )}
            isSubmitting={investSubmitting || contracts.isWritePending}
            onInvest={handleInvestConfirm}
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
            walletTokenBalanceLabel={walletMockTokenLabel}
            onContinue={handlePoolContinue}
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
