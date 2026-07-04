import { useEffect, useMemo, useState } from 'react'
import { formatUnits } from 'viem'

import { formatInvestAmountUsd } from '@/components/dashboard/investor/invest/config'
import {
  buildWithdrawalCompletedMetrics,
  buildWithdrawalReviewRows,
  getInvestmentBalanceDisplay,
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
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { useAppSelector } from '@/store/hooks'
import { formatFlowFailureMessage } from '@/utils/formatFlowFailureMessage'
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
  const investmentBalanceDisplay = useMemo(() => getInvestmentBalanceDisplay(investorMetrics), [investorMetrics])
  const destinationWallet = shortWalletDisplay(walletAddress, walletDisplay ?? '—')
  const displayAmount = amount
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
    if (!contracts.isConnected) return 'Connect your wallet to check on-chain pool position (Arbitrum Sepolia).'
    const { userPoolShares, totalPoolShares, totalPoolAssets, tokenDecimals } = contracts
    if (userPoolShares === undefined || totalPoolShares === undefined || totalPoolAssets === undefined) {
      return 'Reading your pool position…'
    }
    if (totalPoolShares <= 0n)
      return 'No pool shares on-chain yet — fund the pool before withdrawing.'
    const assetWei = (userPoolShares * totalPoolAssets) / totalPoolShares
    const n = Number(formatUnits(assetWei, tokenDecimals))
    const position =
      Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '—'
    const wallet =
      contracts.mockTokenBalanceFormatted === '—'
        ? 'Wallet Balance: —'
        : `Wallet Balance: $${contracts.mockTokenBalanceFormatted}`
    const base = `On-chain pool position (approx.): ${position} token units. ${wallet}.`
    if (!contracts.isCorrectNetwork) {
      return `${base} Switch your wallet to ${contracts.testnetChain.name} to submit withdrawals.`
    }
    return base
  }, [
    contracts.isConnected,
    contracts.isCorrectNetwork,
    contracts.mockTokenBalanceFormatted,
    contracts.testnetChain.name,
    contracts.tokenDecimals,
    contracts.totalPoolAssets,
    contracts.totalPoolShares,
    contracts.userPoolShares,
  ])

  const handleAmountContinue = () => {
    const gate = contracts.canWithdrawHuman(displayAmount)
    if (!gate.ok) {
      openFlowFailure(gate.message ?? 'Cannot continue', WithdrawalStep.AmountEntry, false)
      return
    }
    setWithdrawalStep(WithdrawalStep.MethodConfirmation)
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
            investmentBalanceDisplay={investmentBalanceDisplay}
            walletTokenBalanceLabel={withdrawOnChainHint}
            quickAmounts={WITHDRAW_QUICK_AMOUNTS}
            onAmountSelect={setAmount}
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
