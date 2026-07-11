import type { AccessContext, AccessDecision } from '@/access/types'

/** Match {@link WalletReduxSync} disconnect debounce — Privy wallet list can flicker after idle. */
export const WALLET_SESSION_RESTORE_MS = 2500

/** Require a briefly stable wallet before onboarding hands off to the dashboard. */
export const ONBOARDING_DASHBOARD_HANDOFF_MS = 800

export function isWalletSessionRecoveryReason(reason: AccessDecision['reason']): boolean {
  return reason === 'no_wallet' || reason === 'no_token'
}

/** Onboarded user with API token but wallet not visible yet — wait before kicking to onboarding. */
export function shouldDeferDashboardRedirect(ctx: AccessContext, decision: AccessDecision): boolean {
  return (
    !decision.allowed &&
    Boolean(decision.redirectTo) &&
    ctx.onboarded &&
    ctx.role !== null &&
    Boolean(ctx.accessToken?.length) &&
    isWalletSessionRecoveryReason(decision.reason)
  )
}
