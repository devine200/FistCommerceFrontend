import { INVEST_QUICK_AMOUNTS } from '@/components/dashboard/investor/invest/config'
import type { DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'

export const MERCHANT_REPAY_STEPS = ['Amount', 'Review', 'Done'] as const
export type MerchantRepayStepIndex = 0 | 1 | 2

export const MERCHANT_REPAY_QUICK_AMOUNTS = INVEST_QUICK_AMOUNTS

export const MERCHANT_REPAY_ON_CHAIN_UNAVAILABLE =
  'On-chain repayment is available for live loans with a linked receivable.'

export const MERCHANT_REPAY_WARNING =
  'Smart contract interactions are irreversible. Ensure your wallet is on Arbitrum Sepolia and you have approved sufficient token balance.'

export function merchantRepayPaths(loanId: string) {
  const base = `/dashboard/merchant/receivables/${loanId}/repay`
  return {
    amount: base,
    confirm: `${base}/confirm`,
    failure: `${base}/failure`,
    detail: `/dashboard/merchant/receivables/${loanId}`,
  }
}

export const MERCHANT_REPAY_DEFAULT_FAILURE_MESSAGE =
  'Your repayment could not be completed. Please try again.'

export function merchantRepayBreadcrumbs(loanId: string): DashboardBreadcrumbItem[] {
  return [
    { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
    { label: 'View Receivable', to: merchantRepayPaths(loanId).detail },
    { label: 'Repay Loan' },
  ]
}

export type MerchantRepaySubmitPhase = 'idle' | 'approving' | 'repaying'

export function merchantRepaySubmitButtonLabel(
  phase: MerchantRepaySubmitPhase,
  needsApproval: boolean,
): string {
  if (phase === 'approving') return 'Approving tokens…'
  if (phase === 'repaying') return 'Repaying loan…'
  return needsApproval ? 'Approve & Repay Loan' : 'Repay Loan'
}

export function merchantRepaySubmitStatusMessage(
  phase: MerchantRepaySubmitPhase,
  needsApproval: boolean,
): string | null {
  if (phase === 'approving') {
    return 'Confirm the token approval in your wallet. Repayment will start after approval is confirmed on-chain.'
  }
  if (phase === 'repaying') {
    return 'Token approval confirmed. Confirm the repayment transaction in your wallet.'
  }
  if (needsApproval) {
    return 'You will approve the repayment amount first, then submit the repayment transaction.'
  }
  return null
}
