import { useState } from 'react'
import {
  buildWithdrawalCompletedMetrics,
  buildWithdrawalReviewRows,
  WITHDRAWAL_POOL_NAME,
  WITHDRAWAL_PROCESSING_TIME,
  WITHDRAWAL_WARNING,
  WITHDRAW_DEFAULT_AMOUNT,
  WITHDRAW_QUICK_AMOUNTS,
  WITHDRAW_SOURCES,
} from '@/components/dashboard/investor/withdraw/config'
import WithdrawAmountStep from '@/components/dashboard/investor/withdraw/steps/WithdrawAmountStep'
import WithdrawCompletedStep from '@/components/dashboard/investor/withdraw/steps/WithdrawCompletedStep'
import WithdrawFinalConfirmationStep from '@/components/dashboard/investor/withdraw/steps/WithdrawFinalConfirmationStep'
import WithdrawMethodConfirmationStep from '@/components/dashboard/investor/withdraw/steps/WithdrawMethodConfirmationStep'
import { WithdrawalStep } from '@/components/dashboard/investor/withdraw/types'

interface InvestorWithdrawFlowProps {
  walletDisplay?: string
  step?: WithdrawalStep
  onStepChange?: (step: WithdrawalStep) => void
}

const InvestorWithdrawFlow = ({ walletDisplay, step, onStepChange }: InvestorWithdrawFlowProps) => {
  const [amount, setAmount] = useState(0)
  const [internalStep, setInternalStep] = useState<WithdrawalStep>(WithdrawalStep.AmountEntry)
  const withdrawalStep = step ?? internalStep
  const selectedSource = WITHDRAW_SOURCES[0]?.key ?? 'balance'

  const setWithdrawalStep = (next: WithdrawalStep) => {
    onStepChange?.(next)
    if (step === undefined) setInternalStep(next)
  }

  const displayAmount = amount > 0 ? amount : WITHDRAW_DEFAULT_AMOUNT
  const destinationWallet = walletDisplay ?? '0x7A3F...92C1'

  const renderWithdrawalStep = () => {
    switch (withdrawalStep) {
      case WithdrawalStep.MethodConfirmation:
        return (
          <WithdrawMethodConfirmationStep
            amount={displayAmount}
            poolName={WITHDRAWAL_POOL_NAME}
            processingTime={WITHDRAWAL_PROCESSING_TIME}
            warningText={WITHDRAWAL_WARNING}
            reviewRows={buildWithdrawalReviewRows(selectedSource, displayAmount, destinationWallet)}
            onContinue={() => setWithdrawalStep(WithdrawalStep.FinalConfirmation)}
          />
        )

      case WithdrawalStep.FinalConfirmation:
        return (
          <WithdrawFinalConfirmationStep
            amount={displayAmount}
            destinationWallet={destinationWallet}
            processingTime={WITHDRAWAL_PROCESSING_TIME}
            onConfirm={() => setWithdrawalStep(WithdrawalStep.WithdrawalCompleted)}
          />
        )

      case WithdrawalStep.WithdrawalCompleted:
        return (
          <WithdrawCompletedStep
            amount={displayAmount}
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
            sourceCards={WITHDRAW_SOURCES}
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
