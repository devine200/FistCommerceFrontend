import type { AccessContext } from '@/access/types'

export function hasDashboardSession(ctx: AccessContext): boolean {
  return (
    ctx.role !== null &&
    ctx.walletConnected &&
    Boolean(ctx.walletAddress) &&
    Boolean(ctx.accessToken?.length)
  )
}

/** Privy wallet list still initializing after redux-persist rehydrate. */
export function isSessionBootstrapping(ctx: AccessContext): boolean {
  return ctx.persistedReady && (!ctx.privyReady || !ctx.walletsReady)
}
