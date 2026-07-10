import { useState, useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import MerchantRepayAmountStep from '@/components/dashboard/merchant/repay/MerchantRepayAmountStep'
import MerchantRepayFlowTabs from '@/components/dashboard/merchant/repay/MerchantRepayFlowTabs'
import {
  MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE,
  MERCHANT_REPAY_QUICK_AMOUNTS,
  merchantRepayBreadcrumbs,
  merchantRepayPaths,
} from '@/components/dashboard/merchant/repay/repayFlowConfig'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import {
  useMerchantRepayLoanContext,
  type MerchantRepayLocationState,
} from '@/hooks/useMerchantRepayLoanContext'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { useTokenBalanceLabel } from '@/hooks/useTokenBalanceLabel'
import { useWallet } from '@/hooks/useWallet'
import DashboardLayout from '@/layouts/DashboardLayout'
import {
  clampMerchantRepayAmount,
  validateMerchantRepayAmount,
} from '@/utils/merchantReceivableRepayEligibility'
import { shortWalletDisplay } from '@/utils/shortWalletDisplay'

const MerchantRepayLoanPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const repayContext = useMerchantRepayLoanContext(receivableId)
  const locationState = (location.state ?? {}) as MerchantRepayLocationState
  const { shortAddress, address } = useWallet()
  const contracts = useTestnetContracts()
  const walletTokenBalanceLabel = useTokenBalanceLabel('repay')

  const [amount, setAmount] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  const quickAmounts = useMemo(() => {
    const max = repayContext.amountOwedHuman
    return MERCHANT_REPAY_QUICK_AMOUNTS.filter((v) => max == null || v <= max)
  }, [repayContext.amountOwedHuman])

  const amountValidationError = validateMerchantRepayAmount(amount, repayContext.amountOwedHuman)
  const displayValidationError = validationError ?? amountValidationError

  if (!repayContext.isValid) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  const { loanId } = repayContext
  const paths = merchantRepayPaths(loanId)
  const breadcrumbs = merchantRepayBreadcrumbs(loanId)

  if (!repayContext.isLoading && !repayContext.canRepay) {
    return <Navigate to={paths.detail} replace />
  }

  const handleContinue = () => {
    const owedError = validateMerchantRepayAmount(amount, repayContext.amountOwedHuman)
    if (owedError) {
      setValidationError(owedError)
      return
    }
    const gate = contracts.canRepayReceivable(
      amount,
      repayContext.onChainReceivableId,
      repayContext.amountOwedHuman,
    )
    if (!gate.ok) {
      setValidationError(gate.message ?? 'Cannot continue.')
      return
    }
    if (!repayContext.canRepayOnChain) {
      setValidationError(MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE)
      return
    }
    setValidationError(null)
    navigate(paths.confirm, {
      state: {
        ...locationState,
        receivableName: repayContext.receivableName,
        paymentAmount: amount,
      },
    })
  }

  return (
    <DashboardLayout dashboardBasePath="/dashboard/merchant" topBarBreadcrumbs={breadcrumbs}>
      <DashboardRequestFeedbackLayer
        phase={repayContext.isLoading ? 'loading' : 'idle'}
        loadingTitle="Loading repayment details"
        loadingDescription="Fetching loan balance and repayment information…"
        errorTitle="Unable to load repayment details"
        onDismiss={() => {}}
        onCancelLoading={() => {}}
      />
      <div className="max-w-[820px] w-full mx-auto pt-8 pb-6 flex flex-col gap-6">
        <div>
          <h1 className="text-[#0B1220] font-bold text-[28px] leading-tight">Repay Loan</h1>
          <p className="text-[#6B7488] text-[16px] mt-1.5">
            Make a repayment toward your outstanding loan balance for{' '}
            <span className="font-medium text-[#0B1220]">{repayContext.receivableName}</span>.
          </p>
        </div>

        <MerchantRepayFlowTabs activeStep={0} />

        <MerchantRepayAmountStep
          amount={amount}
          destinationWallet={shortWalletDisplay(shortAddress ?? address)}
          amountOwedLabel={repayContext.amountOwedLabel}
          amountOwedHuman={repayContext.amountOwedHuman}
          walletTokenBalanceLabel={walletTokenBalanceLabel}
          validationError={displayValidationError}
          quickAmounts={quickAmounts}
          onAmountSelect={(v) => {
            const clamped = clampMerchantRepayAmount(v, repayContext.amountOwedHuman)
            setAmount(clamped)
            setValidationError(validateMerchantRepayAmount(clamped, repayContext.amountOwedHuman))
          }}
          onContinue={handleContinue}
        />
      </div>
    </DashboardLayout>
  )
}

export default MerchantRepayLoanPage
