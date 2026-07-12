import { useEffect, useState } from 'react'

import type { AccessContext, AccessDecision } from '@/access/types'
import { shouldDeferDashboardRedirect } from '@/access/walletSessionRestore'
import { recordSessionDiagnostic } from '@/session/sessionDiagnostics'

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
      recordSessionDiagnostic({
        event: 'dashboard_redirect_deferred',
        pathname: ctx.pathname,
        reason: decision.reason,
        redirectTo: decision.redirectTo,
        walletConnected: ctx.walletConnected,
        privyReady: ctx.privyReady,
        walletsReady: ctx.walletsReady,
        onboarded: ctx.onboarded,
        role: ctx.role,
        hasAccessToken: Boolean(ctx.accessToken?.length),
        note: `hold ${delayMs}ms`,
      })
      const timer = window.setTimeout(() => {
        recordSessionDiagnostic({
          event: 'dashboard_redirect',
          pathname: ctx.pathname,
          reason: decision.reason,
          redirectTo: decision.redirectTo,
          walletConnected: ctx.walletConnected,
          privyReady: ctx.privyReady,
          walletsReady: ctx.walletsReady,
          onboarded: ctx.onboarded,
          role: ctx.role,
          hasAccessToken: Boolean(ctx.accessToken?.length),
          note: 'deferred timer fired',
        })
        setRedirectTo(decision.redirectTo)
      }, delayMs)
      return () => window.clearTimeout(timer)
    }

    recordSessionDiagnostic({
      event: 'dashboard_redirect',
      pathname: ctx.pathname,
      reason: decision.reason,
      redirectTo: decision.redirectTo,
      walletConnected: ctx.walletConnected,
      privyReady: ctx.privyReady,
      walletsReady: ctx.walletsReady,
      onboarded: ctx.onboarded,
      role: ctx.role,
      hasAccessToken: Boolean(ctx.accessToken?.length),
      note: 'immediate',
    })
    setRedirectTo(decision.redirectTo)
  }, [
    decision.allowed,
    decision.redirectTo,
    decision.reason,
    shouldDefer,
    delayMs,
    ctx.pathname,
    ctx.walletConnected,
    ctx.walletAddress,
    ctx.onboarded,
    ctx.role,
    ctx.accessToken,
    ctx.privyReady,
    ctx.walletsReady,
  ])

  const hold = shouldDefer && redirectTo === null
  return { hold, redirectTo: decision.allowed ? null : redirectTo }
}
