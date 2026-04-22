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
import FlowFailureStep from '@/components/dashboard/shared/FlowFailureStep'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { useAppSelector } from '@/store/hooks'
import { formatFlowFailureMessage } from '@/utils/formatFlowFailureMessage'

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

function shortWalletDisplay(full: string | null | undefined, fallback: string): string {
  const a = full?.trim() ?? ''
  if (!a) return fallback
  if (a.length <= 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

const InvestorWithdrawFlow = ({ walletDisplay, step, onStepChange }: InvestorWithdrawFlowProps) => {
  const [amount, setAmount] = useState(0)
  const [flowFailure, setFlowFailure] = useState<WithdrawFlowFailure | null>(null)
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
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
    setFlowFailure({
      message: formatFlowFailureMessage(source),
      returnStep,
      showChangeAmount,
    })
    setWithdrawalStep(WithdrawalStep.FlowFailure)
  }

  const withdrawOnChainHint = useMemo(() => {
    if (!contracts.isConnected) return 'Connect your wallet to check on-chain pool position (Sepolia).'
    if (!contracts.isCorrectNetwork)
      return `Switch to ${contracts.testnetChain.name} to validate withdrawals against the testnet pool.`
    const { userPoolShares, totalPoolShares, totalPoolAssets, tokenDecimals } = contracts
    if (userPoolShares === undefined || totalPoolShares === undefined || totalPoolAssets === undefined)
      return 'Reading your pool position…'
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
    return `On-chain pool position (approx.): ${position} mock token units. ${wallet}.`
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
    try {
      await contracts.requestFundingPoolWithdraw(displayAmount)
      setWithdrawalStep(WithdrawalStep.WithdrawalCompleted)
    } catch (e) {
      openFlowFailure(e, WithdrawalStep.FinalConfirmation, true)
    } finally {
      setWithdrawSubmitting(false)
    }
  }

  const renderWithdrawalStep = () => {
    switch (withdrawalStep) {
      case WithdrawalStep.FlowFailure:
        return (
          <FlowFailureStep
            title="We couldn't submit your withdrawal"
            message={flowFailure?.message ?? 'Something went wrong. Please try again.'}
            onPrimary={() => {
              const back = flowFailure?.returnStep ?? WithdrawalStep.AmountEntry
              setFlowFailure(null)
              setWithdrawalStep(back)
            }}
            secondaryLabel={flowFailure?.showChangeAmount ? 'Change amount' : undefined}
            onSecondary={
              flowFailure?.showChangeAmount
                ? () => {
                    setFlowFailure(null)
                    setWithdrawalStep(WithdrawalStep.AmountEntry)
                  }
                : undefined
            }
          />
        )

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

  return <>{renderWithdrawalStep()}</>
}

export default InvestorWithdrawFlow
