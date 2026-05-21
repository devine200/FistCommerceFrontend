import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  merchantRepayPaths,
  merchantRepaySubmitButtonLabel,
  merchantRepaySubmitStatusMessage,
  MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE,
  type MerchantRepaySubmitPhase,
} from '@/components/dashboard/merchant/repay/repayFlowConfig'
import type { MerchantRepayLoanContext } from '@/hooks/useMerchantRepayLoanContext'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { useAppDispatch } from '@/store/hooks'
import { refreshMerchantReceivables } from '@/store/slices/merchantReceivablesSlice'
import { formatFlowFailureMessage } from '@/utils/formatFlowFailureMessage'

type UseMerchantRepaySubmitParams = {
  repayContext: MerchantRepayLoanContext
  paymentAmount: number
  receivableName?: string
}

export function useMerchantRepaySubmit({
  repayContext,
  paymentAmount,
  receivableName,
}: UseMerchantRepaySubmitParams) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const contracts = useTestnetContracts()

  const [phase, setPhase] = useState<MerchantRepaySubmitPhase>('idle')
  const [error, setError] = useState<string | null>(null)

  const needsApproval = contracts.needsRepaymentApproval(paymentAmount)
  const isBusy = phase !== 'idle' || contracts.isWritePending
  const disabled = isBusy || !repayContext.canRepayOnChain

  const submit = useCallback(async () => {
    setError(null)

    const gate = contracts.canRepayReceivable(
      paymentAmount,
      repayContext.onChainReceivableId,
      repayContext.amountOwedHuman,
    )
    if (!gate.ok) {
      setError(gate.message ?? 'Cannot repay.')
      return
    }
    if (!repayContext.onChainReceivableId) {
      setError(MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE)
      return
    }

    const { loanId } = repayContext
    const paths = merchantRepayPaths(loanId)

    try {
      await contracts.executeMerchantRepayment(
        paymentAmount,
        repayContext.onChainReceivableId,
        (next) => setPhase(next),
      )

      void dispatch(refreshMerchantReceivables())
      void queryClient.invalidateQueries({ queryKey: ['loan-details'] })
      navigate(paths.detail, { replace: true })
    } catch (e) {
      navigate(paths.failure, {
        replace: true,
        state: {
          message: formatFlowFailureMessage(e),
          receivableName,
          paymentAmount,
        },
      })
    } finally {
      setPhase('idle')
    }
  }, [
    contracts,
    dispatch,
    navigate,
    queryClient,
    paymentAmount,
    receivableName,
    repayContext.amountOwedHuman,
    repayContext.loanId,
    repayContext.onChainReceivableId,
  ])

  return {
    submit,
    phase,
    error,
    disabled,
    buttonLabel: merchantRepaySubmitButtonLabel(phase, needsApproval),
    statusMessage: merchantRepaySubmitStatusMessage(phase, needsApproval),
  }
}
