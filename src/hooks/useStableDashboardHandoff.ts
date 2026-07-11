import { useEffect, useState } from 'react'

/** True after `enabled` stays true for `delayMs` (avoids onboarding → dashboard flicker). */
export function useStableDashboardHandoff(enabled: boolean, delayMs: number): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setReady(false)
      return
    }

    const timer = window.setTimeout(() => setReady(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [enabled, delayMs])

  return ready
}
