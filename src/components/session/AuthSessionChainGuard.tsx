import { useEffect, useRef } from 'react'

import { markAppSessionExpired } from '@/session/sessionEnd'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { APP_CHAIN } from '@/wallet/appChain'

/**
 * Invalidates a persisted API session when its bound `chainId` no longer matches
 * the env-pinned `APP_CHAIN` (e.g. after flipping `VITE_CONTRACT_NETWORK`).
 * Separate from wallet wrong-network UX in `ArbitrumSepoliaWalletEnforcer`.
 */
export default function AuthSessionChainGuard() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const refreshToken = useAppSelector((s) => s.auth.refreshToken)
  const authChainId = useAppSelector((s) => s.auth.chainId)
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const role = useAppSelector((s) => s.auth.role)
  const handledKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (sessionExpired) {
      handledKeyRef.current = null
      return
    }
    const hasTokens = Boolean(accessToken || refreshToken)
    if (!hasTokens || authChainId == null) return
    if (authChainId === APP_CHAIN.id) {
      handledKeyRef.current = null
      return
    }

    const key = `${authChainId}:${APP_CHAIN.id}:${sessionKind ?? 'none'}`
    if (handledKeyRef.current === key) return
    handledKeyRef.current = key

    void markAppSessionExpired(dispatch, {
      reason: 'chain_mismatch',
      accessToken,
      sessionKind,
      role,
      keepRole: true,
    })
  }, [dispatch, accessToken, refreshToken, authChainId, sessionExpired, sessionKind, role])

  return null
}
