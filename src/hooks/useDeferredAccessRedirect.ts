import { useEffect, useState } from 'react'

import type { AccessContext, AccessDecision } from '@/access/types'
import { shouldDeferDashboardRedirect } from '@/access/walletSessionRestore'

/**
 * Delays dashboard → onboarding redirects while wallet/session may still be restoring.
 * Non-recoverable decisions (e.g. not onboarded) redirect immediately.
 */
export function useDeferredAccessRedirect(
  decision: AccessDecision,
  ctx: AccessContext,
  delayMs: number,
): { hold: boolean; redirectTo: string | null } {
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const shouldDefer = shouldDeferDashboardRedirect(ctx, decision)

  useEffect(() => {
    if (decision.allowed || !decision.redirectTo) {
      setRedirectTo(null)
      return
    }

    if (shouldDefer) {
      const timer = window.setTimeout(() => {
        setRedirectTo(decision.redirectTo)
      }, delayMs)
      return () => window.clearTimeout(timer)
    }

    setRedirectTo(decision.redirectTo)
  }, [
    decision.allowed,
    decision.redirectTo,
    decision.reason,
    shouldDefer,
    delayMs,
    ctx.walletConnected,
    ctx.walletAddress,
    ctx.onboarded,
    ctx.role,
    ctx.accessToken,
  ])

  const hold = shouldDefer && redirectTo === null
  return { hold, redirectTo: decision.allowed ? null : redirectTo }
}
