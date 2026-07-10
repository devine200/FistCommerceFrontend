import { displayDashboardMetricString } from '@/api/metrics'

export function validateInvestDepositAmount(
  amount: number,
  maxWalletHuman: number | null | undefined,
): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter an amount greater than zero.'
  }
  if (maxWalletHuman == null) return null
  if (maxWalletHuman <= 0) {
    return 'Your wallet has no tokens available to deposit. Mint test tokens first.'
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
