import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'
import type { AccessContext } from '@/access/types'
import { isAdminSession } from '@/auth/adminSession'

/** Investor/merchant dashboard session — excludes staff admin tokens on onboarding. */
export function hasDashboardSession(ctx: AccessContext): boolean {
  if (isAdminSession(ctx.accessToken, ctx.sessionKind)) return false
  return (
    ctx.role !== null &&
    ctx.walletConnected &&
    Boolean(ctx.walletAddress) &&
    isUsableApiAccessToken(ctx.accessToken)
  )
}

/** Privy wallet list still initializing after redux-persist rehydrate. */
export function isSessionBootstrapping(ctx: AccessContext): boolean {
  return ctx.persistedReady && (!ctx.privyReady || !ctx.walletsReady)
}
