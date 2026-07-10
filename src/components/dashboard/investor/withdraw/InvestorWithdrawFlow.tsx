import { useEffect, useMemo, useState } from 'react'

import { formatInvestAmountUsd } from '@/components/dashboard/investor/invest/config'
import {
  buildWithdrawalCompletedMetrics,
  buildWithdrawalReviewRows,
  WITHDRAWAL_PROCESSING_TIME,
  WITHDRAWAL_WARNING,
  WITHDRAW_QUICK_AMOUNTS,
} from '@/components/dashboard/investor/withdraw/config'
import WithdrawAmountStep from '@/components/dashboard/investor/withdraw/steps/WithdrawAmountStep'
import WithdrawCompletedStep from '@/components/dashboard/investor/withdraw/steps/WithdrawCompletedStep'
import WithdrawFinalConfirmationStep from '@/components/dashboard/investor/withdraw/steps/WithdrawFinalConfirmationStep'
import WithdrawMethodConfirmationStep from '@/components/dashboard/investor/withdraw/steps/WithdrawMethodConfirmationStep'
import { WithdrawalStep } from '@/components/dashboard/investor/withdraw/types'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import { useInvestorOnChainBalances } from '@/hooks/useInvestorOnChainBalances'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { useAppSelector } from '@/store/hooks'
import { formatFlowFailureMessage } from '@/utils/formatFlowFailureMessage'
import {
  clampToMaxHuman,
  filterQuickAmountsByMax,
  validateInvestWithdrawAmount,
} from '@/utils/investorFlowAmountLimits'
import { shortWalletDisplay } from '@/utils/shortWalletDisplay'

interface InvestorWithdrawFlowProps {
  walletDisplay?: string
  step?: WithdrawalStep
  onStepChange?: (step: WithdrawalStep) => void
}

type WithdrawFlowFailure = {
  message: string
  returnStep: WithdrawalStep
  showChangeAmount: boolean
}

const InvestorWithdrawFlow = ({ walletDisplay, step, onStepChange }: InvestorWithdrawFlowProps) => {
  const [amount, setAmount] = useState(0)
  const [flowFailure, setFlowFailure] = useState<WithdrawFlowFailure | null>(null)
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
  const [feedbackPhase, setFeedbackPhase] = useState<'idle' | 'loading' | 'failed'>('idle')
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [internalStep, setInternalStep] = useState<WithdrawalStep>(WithdrawalStep.AmountEntry)
  const withdrawalStep = step ?? internalStep

  const lendingPool = useAppSelector((s) => s.investorDashboard.lendingPools)
  const poolMetrics = useAppSelector((s) => s.investorDashboard.poolMetrics)
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)
  const walletAddress = useAppSelector((s) => s.wallet.address)

  const poolName = lendingPool.poolTitle?.trim() || 'Lending pool'
  const { investmentBalanceDisplay, walletBalanceDisplay, investmentBalanceHuman } = useInvestorOnChainBalances()
  const displayAmount = amount

  const withdrawQuickAmounts = useMemo(
    () => filterQuickAmountsByMax(WITHDRAW_QUICK_AMOUNTS, investmentBalanceHuman),
    [investmentBalanceHuman],
  )

  const withdrawAmountError = validateInvestWithdrawAmount(displayAmount, investmentBalanceHuman)
  const destinationWallet = shortWalletDisplay(walletAddress, walletDisplay ?? '—')
  const amountDisplay = formatInvestAmountUsd(displayAmount)

  const contracts = useTestnetContracts({
    estimateWithdrawHumanAmount:
      withdrawalStep === WithdrawalStep.MethodConfirmation ||
      withdrawalStep === WithdrawalStep.FinalConfirmation
        ? displayAmount
        : undefined,
  })

  const setWithdrawalStep = (next: WithdrawalStep) => {
    onStepChange?.(next)
    if (step === undefined) setInternalStep(next)
  }

  useEffect(() => {
    if (withdrawalStep !== WithdrawalStep.FlowFailure) setFlowFailure(null)
  }, [withdrawalStep])

  const openFlowFailure = (source: unknown, returnStep: WithdrawalStep, showChangeAmount: boolean) => {
    const message = formatFlowFailureMessage(source)
    setFlowFailure({ message, returnStep, showChangeAmount })
    setFeedbackError(message)
    setFeedbackPhase('failed')
    setWithdrawalStep(returnStep)
  }

  const withdrawOnChainHint = useMemo(() => {
    if (!contracts.isConnected) return 'Connect your wallet on Arbitrum Sepolia to withdraw from the pool.'
    if (!contracts.isCorrectNetwork) {
      return `Switch your wallet to ${contracts.testnetChain.name} to submit withdrawals.`
    }
    if (contracts.poolPositionLoading) return 'Reading your on-chain pool position…'
    if (contracts.poolPositionHuman === null) return 'Could not read pool position.'
    if (contracts.poolPositionHuman <= 0) return 'No on-chain pool position yet — invest in the pool first.'
    return null
  }, [
    contracts.isConnected,
    contracts.isCorrectNetwork,
    contracts.poolPositionHuman,
    contracts.poolPositionLoading,
    contracts.testnetChain.name,
  ])

  const handleAmountContinue = () => {
    const uiError = validateInvestWithdrawAmount(displayAmount, investmentBalanceHuman)
    if (uiError) {
      openFlowFailure(uiError, WithdrawalStep.AmountEntry, false)
      return
    }
    const gate = contracts.canWithdrawHuman(displayAmount)
    if (!gate.ok) {
      openFlowFailure(gate.message ?? 'Cannot continue', WithdrawalStep.AmountEntry, false)
      return
    }
    setWithdrawalStep(WithdrawalStep.MethodConfirmation)
  }

  const handleAmountSelect = (value: number) => {
    setAmount(clampToMaxHuman(value, investmentBalanceHuman))
  }

  const handleWithdrawConfirm = async () => {
    setWithdrawSubmitting(true)
    setFeedbackPhase('loading')
    setFeedbackError(null)
    try {
      await contracts.requestFundingPoolWithdraw(displayAmount)
      setFeedbackPhase('idle')
      setWithdrawalStep(WithdrawalStep.WithdrawalCompleted)
    } catch (e) {
      openFlowFailure(e, WithdrawalStep.FinalConfirmation, true)
    } finally {
      setWithdrawSubmitting(false)
    }
  }

  const activeFeedbackPhase =
    withdrawSubmitting || contracts.isWritePending ? 'loading' : feedbackPhase

  const renderWithdrawalStep = () => {
    switch (withdrawalStep) {
      case WithdrawalStep.MethodConfirmation:
        return (
          <WithdrawMethodConfirmationStep
            amountDisplay={amountDisplay}
            poolName={poolName}
            processingTime={WITHDRAWAL_PROCESSING_TIME}
            warningText={WITHDRAWAL_WARNING}
            reviewRows={buildWithdrawalReviewRows(
              displayAmount,
              destinationWallet,
              poolName,
              poolMetrics,
              investorMetrics,
              investmentBalanceDisplay,
              { gasFeeEstimateDisplay: contracts.withdrawGasFeeLabel },
            )}
            onContinue={() => setWithdrawalStep(WithdrawalStep.FinalConfirmation)}
          />
        )

      case WithdrawalStep.FinalConfirmation:
        return (
          <WithdrawFinalConfirmationStep
            amountDisplay={amountDisplay}
            destinationWallet={destinationWallet}
            processingTime={WITHDRAWAL_PROCESSING_TIME}
            estimatedNetworkFeeLabel={contracts.withdrawGasFeeLabel}
            isSubmitting={withdrawSubmitting || contracts.isWritePending}
            onConfirm={handleWithdrawConfirm}
          />
        )

      case WithdrawalStep.WithdrawalCompleted:
        return (
          <WithdrawCompletedStep
            amountDisplay={amountDisplay}
            poolName={poolName}
            metrics={buildWithdrawalCompletedMetrics(displayAmount)}
            backToDashboardTo="/dashboard/investor/overview"
          />
        )

      case WithdrawalStep.AmountEntry:
      default:
        return (
          <WithdrawAmountStep
            amount={amount}
            destinationWallet={destinationWallet}
            walletBalanceDisplay={walletBalanceDisplay}
            investmentBalanceDisplay={investmentBalanceDisplay}
            maxAmountHuman={investmentBalanceHuman}
            validationError={withdrawAmountError}
            onChainHint={withdrawOnChainHint}
            quickAmounts={withdrawQuickAmounts}
            onAmountSelect={handleAmountSelect}
            onContinue={handleAmountContinue}
          />
        )
    }
  }

  return (
    <>
      <DashboardRequestFeedbackLayer
        phase={activeFeedbackPhase}
        loadingTitle="Submitting withdrawal"
        loadingDescription="Confirm the withdrawal request in your wallet…"
        errorTitle="Unable to submit withdrawal"
        errorDescription={feedbackError ?? flowFailure?.message}
        onDismiss={() => {
          setFeedbackPhase('idle')
          setFeedbackError(null)
          setFlowFailure(null)
        }}
        onRetry={() => {
          setFeedbackPhase('idle')
          setFeedbackError(null)
          if (flowFailure?.returnStep === WithdrawalStep.FinalConfirmation) {
            void handleWithdrawConfirm()
            return
          }
          if (flowFailure?.returnStep) setWithdrawalStep(flowFailure.returnStep)
        }}
      />
      {renderWithdrawalStep()}
    </>
  )
}

export default InvestorWithdrawFlow
