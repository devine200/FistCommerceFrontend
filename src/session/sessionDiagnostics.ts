import { store } from '@/store'

export const SESSION_DIAGNOSTICS_STORAGE_KEY = 'fistcommerce.sessionDiagnostics'
export const SESSION_DIAGNOSTICS_MAX = 40
export const FC_RESET_SESSION_QUERY = 'fc_reset_session'

export type SessionDiagnosticEventName =
  | 'onboarding_complete'
  | 'onboarding_handoff'
  | 'dashboard_redirect_deferred'
  | 'dashboard_redirect'
  | 'dashboard_guard_navigate'
  | 'wallet_disconnect_reset'
  | 'wallet_address_change_reset'
  | 'privy_logout_reset'
  | 'auth_failure_logout'
  | 'require_onboarded_redirect'
  | 'manual_session_reset'
  | 'local_session_reset'
  | 'diag_boot'

export type SessionDiagnosticEvent = {
  t: string
  event: SessionDiagnosticEventName | string
  pathname: string
  onboarded?: boolean
  role?: string | null
  hasAccessToken?: boolean
  hasRefreshToken?: boolean
  accessTokenLen?: number
  walletConnected?: boolean
  privyReady?: boolean
  walletsReady?: boolean
  authenticated?: boolean
  reason?: string | null
  redirectTo?: string | null
  note?: string
  status?: number
}

type SessionDiagnosticInput = {
  event: SessionDiagnosticEventName | string
  pathname?: string
  onboarded?: boolean
  role?: string | null
  hasAccessToken?: boolean
  hasRefreshToken?: boolean
  accessTokenLen?: number
  walletConnected?: boolean
  privyReady?: boolean
  walletsReady?: boolean
  authenticated?: boolean
  reason?: string | null
  redirectTo?: string | null
  note?: string
  status?: number
}

declare global {
  interface Window {
    __fcSessionDiag?: {
      dump: () => string
      clear: () => void
      resetLocalSession: () => Promise<void>
      get: () => SessionDiagnosticEvent[]
    }
  }
}

function isDiagnosticsEnabled(): boolean {
  const flag = import.meta.env.VITE_SESSION_DIAGNOSTICS
  if (flag === undefined || flag === '') return true
  return String(flag).toLowerCase() !== '0' && String(flag).toLowerCase() !== 'false'
}

function readBuffer(): SessionDiagnosticEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(SESSION_DIAGNOSTICS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as SessionDiagnosticEvent[]) : []
  } catch {
    return []
  }
}

function writeBuffer(events: SessionDiagnosticEvent[]) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(SESSION_DIAGNOSTICS_STORAGE_KEY, JSON.stringify(events))
  } catch {
    /* ignore quota / private mode */
  }
}

function snapshotFromStore(): Pick<
  SessionDiagnosticEvent,
  'onboarded' | 'role' | 'hasAccessToken' | 'hasRefreshToken' | 'accessTokenLen'
> {
  try {
    const auth = store.getState().auth
    const access = auth.accessToken
    return {
      onboarded: Boolean(auth.onboarded),
      role: auth.role,
      hasAccessToken: Boolean(access?.length),
      hasRefreshToken: Boolean(auth.refreshToken?.length),
      accessTokenLen: access?.length ?? 0,
    }
  } catch {
    return {}
  }
}

/** Append a redacted session diagnostic event (console + sessionStorage ring buffer). */
export function recordSessionDiagnostic(input: SessionDiagnosticInput): void {
  if (!isDiagnosticsEnabled()) return

  const pathname =
    input.pathname ??
    (typeof window !== 'undefined' ? window.location.pathname : '')

  const fromStore = snapshotFromStore()
  const entry: SessionDiagnosticEvent = {
    t: new Date().toISOString(),
    event: input.event,
    pathname,
    onboarded: input.onboarded ?? fromStore.onboarded,
    role: input.role !== undefined ? input.role : fromStore.role,
    hasAccessToken: input.hasAccessToken ?? fromStore.hasAccessToken,
    hasRefreshToken: input.hasRefreshToken ?? fromStore.hasRefreshToken,
    accessTokenLen: input.accessTokenLen ?? fromStore.accessTokenLen,
    walletConnected: input.walletConnected,
    privyReady: input.privyReady,
    walletsReady: input.walletsReady,
    authenticated: input.authenticated,
    reason: input.reason ?? null,
    redirectTo: input.redirectTo ?? null,
    note: input.note,
    status: input.status,
  }

  const next = [...readBuffer(), entry].slice(-SESSION_DIAGNOSTICS_MAX)
  writeBuffer(next)
  console.info('[session-diag]', entry)
}

export function getSessionDiagnostics(): SessionDiagnosticEvent[] {
  return readBuffer()
}

export function clearSessionDiagnostics(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(SESSION_DIAGNOSTICS_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function exportSessionDiagnosticsJson(): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    href: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    events: getSessionDiagnostics(),
  }
  return JSON.stringify(payload, null, 2)
}

export function dumpSessionDiagnostics(): string {
  const json = exportSessionDiagnosticsJson()
  console.info('[session-diag] dump\n', json)
  return json
}

/**
 * Clears persisted auth/onboarding/wallet session and reloads to choose-role.
 * Intended for beta support via `window.__fcSessionDiag.resetLocalSession()`.
 */
export async function resetLocalSessionWithDiagnostics(): Promise<void> {
  recordSessionDiagnostic({
    event: 'manual_session_reset',
    note: 'console or ?fc_reset_session=1',
  })
  dumpSessionDiagnostics()

  const { store, persistor } = await import('@/store')
  const { resetUserSession } = await import('@/session/resetUserSession')
  resetUserSession(store.dispatch)
  try {
    await persistor.purge()
  } catch {
    /* ignore */
  }
  try {
    await persistor.flush()
  } catch {
    /* ignore */
  }

  recordSessionDiagnostic({
    event: 'local_session_reset',
    note: 'purged persist; redirecting to choose-role',
    onboarded: false,
    role: null,
    hasAccessToken: false,
    hasRefreshToken: false,
    accessTokenLen: 0,
  })

  window.location.replace('/onboarding/choose-role')
}

/** Attach `window.__fcSessionDiag` for beta console access. */
export function installSessionDiagnosticsWindowApi(): void {
  if (typeof window === 'undefined' || !isDiagnosticsEnabled()) return
  window.__fcSessionDiag = {
    dump: dumpSessionDiagnostics,
    clear: clearSessionDiagnostics,
    resetLocalSession: () => resetLocalSessionWithDiagnostics(),
    get: getSessionDiagnostics,
  }
}

/** One-shot local reset when URL contains `?fc_reset_session=1`. */
export function consumeResetSessionQueryParam(): void {
  if (typeof window === 'undefined' || !isDiagnosticsEnabled()) return
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.get(FC_RESET_SESSION_QUERY) !== '1') return
    url.searchParams.delete(FC_RESET_SESSION_QUERY)
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    void resetLocalSessionWithDiagnostics()
  } catch {
    /* ignore */
  }
}
