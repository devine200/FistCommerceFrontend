import { useMemo, useState } from 'react'

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
import { useAppSelector } from '@/store/hooks'

interface InvestorWithdrawFlowProps {
  walletDisplay?: string
  step?: WithdrawalStep
  onStepChange?: (step: WithdrawalStep) => void
}

function shortWalletDisplay(full: string | null | undefined, fallback: string): string {
  const a = full?.trim() ?? ''
  if (!a) return fallback
  if (a.length <= 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

const InvestorWithdrawFlow = ({ walletDisplay, step, onStepChange }: InvestorWithdrawFlowProps) => {
  const [amount, setAmount] = useState(0)
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

  const setWithdrawalStep = (next: WithdrawalStep) => {
    onStepChange?.(next)
    if (step === undefined) setInternalStep(next)
  }

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
            onConfirm={() => setWithdrawalStep(WithdrawalStep.WithdrawalCompleted)}
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
            quickAmounts={WITHDRAW_QUICK_AMOUNTS}
            onAmountSelect={setAmount}
            onContinue={() => setWithdrawalStep(WithdrawalStep.MethodConfirmation)}
          />
        )
    }
  }

  return <>{renderWithdrawalStep()}</>
}

export default InvestorWithdrawFlow
