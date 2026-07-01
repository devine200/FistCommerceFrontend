import { getAddress, type Address, type Hex } from 'viem'

import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import { sanitizeAccessToken, sanitizeRefreshToken } from '@/auth/accessTokenPolicy'
import type { WalletLoginSignable } from '@/api/walletSession'

/**
 * Admin wallet login per OpenAPI (`POST /auth/admin-login`).
 * Same EIP-712 payload as user login; no `role` field. Backend requires multisig owner.
 */
const ADMIN_LOGIN_PATH = '/api/auth/admin-login'

export type AdminLoginResponseBody = {
  successMessage?: string
  access_token: string
  refresh_token?: string
}

export type AdminLoginResult = {
  accessToken: string
  refreshToken: string | null
  successMessage: string
}

export async function postAdminWalletLogin(params: {
  signedMessage: WalletLoginSignable['signedMessageForApi']
  signature: Hex
  signerAddress: string
}): Promise<AdminLoginResult> {
  const base = requireApiBaseUrl()
  const res = await fetch(`${base}${ADMIN_LOGIN_PATH}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signedMessage: params.signedMessage,
      signature: params.signature,
      signerAddress: getAddress(params.signerAddress as Address),
    }),
  })

  const body = await parseJsonResponse<AdminLoginResponseBody & { token?: string }>(res)
  const accessToken = sanitizeAccessToken(body.access_token ?? body.token)
  if (!accessToken) {
    throw new Error('Server did not return an access token.')
  }
  const refreshToken = sanitizeRefreshToken(body.refresh_token)

  return {
    accessToken,
    refreshToken,
    successMessage: body.successMessage?.trim() || 'successful authentication',
  }
}
