import * as React from 'react'

import { getSession, type SessionState } from '@/state/session'

function subscribe(callback: () => void) {
  const onChange = () => callback()
  window.addEventListener('storage', onChange)
  window.addEventListener('fistcommerce:session-change', onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener('fistcommerce:session-change', onChange)
  }
}

// `useSyncExternalStore` requires `getSnapshot` to return a stable reference
// when the underlying store hasn't changed. `getSession()` creates a new object
// each call, so we cache snapshots by the raw localStorage value.
let lastRaw: string | null = null
let lastSnapshot: SessionState = getSession()

function getSnapshotCached(): SessionState {
  try {
    const raw = localStorage.getItem('fistcommerce.session.v2')
    if (raw === lastRaw) return lastSnapshot
    lastRaw = raw
    lastSnapshot = getSession()
    return lastSnapshot
  } catch {
    // In environments where localStorage isn't available, fall back.
    return lastSnapshot
  }
}

export function useSession() {
  return React.useSyncExternalStore(subscribe, getSnapshotCached, getSnapshotCached)
}

