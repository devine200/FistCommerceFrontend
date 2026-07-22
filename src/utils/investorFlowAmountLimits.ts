import { displayDashboardMetricString } from '@/api/metrics'
import { canMintTestTokens, getAcceptedTokenDisplayName } from '@/contract_config/contractNetwork'

export const INSUFFICIENT_BALANCE_ORDER_HINT = 'Insufficient balance to fulfil order.'

export function isInvestAmountOverMax(
  amount: number,
  maxHuman: number | null | undefined,
): boolean {
  if (maxHuman == null || !Number.isFinite(maxHuman) || maxHuman <= 0) return false
  return Number.isFinite(amount) && amount > maxHuman + 1e-9
}

export function resolveInvestFlowContinueHint(
  amount: number,
  maxHuman: number | null | undefined,
  validationError?: string | null,
): string | null {
  if (isInvestAmountOverMax(amount, maxHuman)) return INSUFFICIENT_BALANCE_ORDER_HINT
  if (validationError) return validationError
  if (!Number.isFinite(amount) || amount <= 0) return 'Enter an amount greater than zero.'
  return null
}

export function validateInvestDepositAmount(
  amount: number,
  maxWalletHuman: number | null | undefined,
): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter an amount greater than zero.'
  }
  if (maxWalletHuman == null) return null
  if (maxWalletHuman <= 0) {
    const token = getAcceptedTokenDisplayName()
    return canMintTestTokens()
      ? `Your wallet has no ${token} available to deposit. Mint test tokens first.`
      : `Your wallet has no ${token} available to deposit.`
  }
  if (amount > maxWalletHuman + 1e-9) {
    return `Amount cannot exceed your wallet balance of ${displayDashboardMetricString(maxWalletHuman)}.`
  }
  return null
}

export function validateInvestWithdrawAmount(
  amount: number,
  maxPoolHuman: number | null | undefined,
): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter an amount greater than zero.'
  }
  if (maxPoolHuman == null) return null
  if (maxPoolHuman <= 0) {
    return 'No on-chain pool position yet — invest in the pool first.'
  }
  if (amount > maxPoolHuman + 1e-9) {
    return `Amount cannot exceed your investment balance of ${displayDashboardMetricString(maxPoolHuman)}.`
  }
  return null
}

export function clampToMaxHuman(amount: number, maxHuman: number | null | undefined): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (maxHuman == null || !Number.isFinite(maxHuman) || maxHuman <= 0) return amount
  return Math.min(amount, maxHuman)
}

export function filterQuickAmountsByMax(
  quickAmounts: readonly number[],
  maxHuman: number | null | undefined,
): number[] {
  if (maxHuman == null || !Number.isFinite(maxHuman) || maxHuman <= 0) return [...quickAmounts]
  return quickAmounts.filter((v) => v <= maxHuman + 1e-9)
}
