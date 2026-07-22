import { useEffect, useRef } from 'react'

import { markAppSessionExpired } from '@/session/sessionEnd'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { isSupportedAppChainId } from '@/wallet/appChain'

/**
 * Safety net for persisted sessions on an unsupported/missing chain binding.
 * Wallet↔session chain switches while logged in are handled by `WalletReduxSync`
 * (automatic logout).
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
    if (!hasTokens) return

    // Pre-v8 / corrupt: tokens without a valid supported session chain → re-login.
    if (authChainId == null || !isSupportedAppChainId(authChainId)) {
      const key = `invalid:${authChainId ?? 'null'}:${sessionKind ?? 'none'}`
      if (handledKeyRef.current === key) return
      handledKeyRef.current = key
      void markAppSessionExpired(dispatch, {
        reason: 'chain_mismatch',
        accessToken,
        sessionKind,
        role,
        keepRole: true,
      })
    }
  }, [dispatch, accessToken, refreshToken, authChainId, sessionExpired, sessionKind, role])

  return null
}
