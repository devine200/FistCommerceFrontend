import { apiUrl } from '@/api/client'
import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { normalizeMultisigConfig } from '@/api/multisig/normalize'
import type { MultisigConfig } from '@/api/types/multisig'

const MULTISIG_CONFIG_PATH = '/multisig/config/'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for multisig config request.')
  const header = /^Token\s+\S+/i.test(t) ? t : `Token ${t}`
  return {
    Accept: 'application/json',
    Authorization: header,
  }
}

/** `GET /api/multisig/config/` */
export async function fetchMultisigConfig(
  accessToken: string | null | undefined,
): Promise<MultisigConfig> {
  const res = await fetchWithAuthRecovery(apiUrl(MULTISIG_CONFIG_PATH), {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const raw = await res.json()
  return normalizeMultisigConfig(raw)
}
