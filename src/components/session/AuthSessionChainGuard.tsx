import { useEffect, useRef } from 'react'

import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { patchAuth, resetAuth } from '@/store/slices/authSlice'
import { isSupportedAppChainId } from '@/wallet/appChain'

/**
 * Clears corrupt persisted sessions and sticky “session expired” with no credentials.
 * Wallet↔session chain switches while logged in are handled by `WalletReduxSync`.
 */
export default function AuthSessionChainGuard() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const refreshToken = useAppSelector((s) => s.auth.refreshToken)
  const authChainId = useAppSelector((s) => s.auth.chainId)
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired)
  const handledKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const hasUsableTokens =
      Boolean(refreshToken?.trim()) || isUsableApiAccessToken(accessToken)

    // Sticky expired flag with no session — dismiss modal without wiping onboarding role.
    if (sessionExpired && !hasUsableTokens) {
      dispatch(
        patchAuth({
          sessionExpired: false,
          sessionExpiredReason: null,
          accessToken: null,
          refreshToken: null,
          chainId: null,
          wallet: null,
        }),
      )
      return
    }

    if (!hasUsableTokens) return

    if (authChainId == null || !isSupportedAppChainId(authChainId)) {
      const key = `invalid:${authChainId ?? 'null'}`
      if (handledKeyRef.current === key) return
      handledKeyRef.current = key
      dispatch(resetAuth())
    }
  }, [dispatch, accessToken, refreshToken, authChainId, sessionExpired])

  return null
}
