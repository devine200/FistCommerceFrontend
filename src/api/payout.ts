import { fetchWithAuthRecovery } from '@/api/authorizedFetch'
import { parseJsonResponse, requireApiBaseUrl } from '@/api/client'
import { displayDashboardMetricString } from '@/api/metrics'
import type { RecentTx } from '@/components/dashboard/investor/lending-pool-detail/types'

const RECENT_TRANSACTIONS_PATH = '/api/payout/recent-transactions/'

const TRANSACTION_ARRAY_KEYS = ['transactions', 'results', 'data', 'recent_transactions', 'items'] as const

const CONTRACT_KEYS = [
  'smart_contract_address',
  'contract_address',
  'pool_contract_address',
  'lending_pool_contract_address',
] as const

const EXPLORER_BASE_KEYS = [
  'block_explorer_base_url',
  'explorer_base_url',
  'sepolia_block_explorer_url',
  'eth_sepolia_block_explorer_url',
] as const

/** Row shape from `GET /api/payout/recent-transactions/`. */
export type RecentTxApi = {
  transaction_type: string
  amount: number
  contract_address: string
  time_since: string
  /** On-chain tx hash — explorer row link targets `/tx/…` when present. */
  transaction_hash?: string
}

/** JSON body for recent transactions (strict DRF shape). */
export type RecentTxResponse = {
  transactions: RecentTxApi[]
}

/** Vite: Sepolia explorer origin (no trailing slash), e.g. `https://sepolia.etherscan.io` */
export function getDefaultSepoliaBlockExplorerBase(): string | null {
  const raw = import.meta.env.VITE_ETH_SEPOLIA_BLOCK_EXPLORER_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/+$/, '')
}

/** Optional pool contract on Sepolia when the payout API does not return one on the envelope. */
export function getDefaultSepoliaPoolContractAddress(): string | null {
  const raw = import.meta.env.VITE_ETH_SEPOLIA_POOL_CONTRACT_ADDRESS?.trim()
  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) return null
  return raw
}

export function blockExplorerAddressUrl(base: string, address: string): string | null {
  const b = base.trim().replace(/\/+$/, '')
  const a = address.trim()
  if (!b || !/^0x[a-fA-F0-9]{40}$/i.test(a)) return null
  return `${b}/address/${a}`
}

/** Canonical `0x` + 64 hex chars for an Ethereum tx hash, or `null`. */
function normalizeEthereumTxHash(raw: string): string | null {
  const t = raw.trim()
  if (/^[a-fA-F0-9]{64}$/i.test(t)) return `0x${t}`
  if (/^0x[a-fA-F0-9]{64}$/i.test(t)) return t
  return null
}

/** Etherscan-style `/tx/{hash}` (32-byte hash, with or without `0x`). */
export function blockExplorerTxUrl(base: string, txHash: string): string | null {
  const b = base.trim().replace(/\/+$/, '')
  const h = normalizeEthereumTxHash(txHash)
  if (!b || !h) return null
  return `${b}/tx/${h}`
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object') return null
  return v as Record<string, unknown>
}

function pickString(obj: Record<string, unknown>, keys: readonly string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function isHexAddress(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/i.test(s.trim())
}

function shortEthAddress(addr: string): string {
  const a = addr.trim()
  if (!a) return '—'
  if (a.length <= 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function extractTransactionRows(body: unknown): unknown[] {
  if (Array.isArray(body)) return body
  const o = asRecord(body)
  if (!o) return []
  for (const k of TRANSACTION_ARRAY_KEYS) {
    const v = o[k]
    if (Array.isArray(v)) return v
  }
  return []
}

function extractContractAndExplorer(body: unknown): { contractAddress: string | null; explorerBaseUrl: string | null } {
  const o = asRecord(body)
  if (!o) return { contractAddress: null, explorerBaseUrl: null }
  let contractAddress: string | null = null
  for (const k of CONTRACT_KEYS) {
    const v = o[k]
    if (typeof v === 'string' && isHexAddress(v)) {
      contractAddress = v.trim()
      break
    }
  }
  let explorerBaseUrl: string | null = null
  for (const k of EXPLORER_BASE_KEYS) {
    const v = o[k]
    if (typeof v === 'string' && v.trim()) {
      explorerBaseUrl = v.trim().replace(/\/+$/, '')
      break
    }
  }
  return { contractAddress, explorerBaseUrl }
}

function isRecentTxApiRow(row: unknown): row is RecentTxApi {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  return (
    typeof r.transaction_type === 'string' &&
    typeof r.amount === 'number' &&
    Number.isFinite(r.amount) &&
    typeof r.contract_address === 'string' &&
    typeof r.time_since === 'string'
  )
}

function isRecentTxResponseShape(json: unknown): json is RecentTxResponse {
  const o = asRecord(json)
  if (!o || !Array.isArray(o.transactions)) return false
  if (o.transactions.length === 0) return true
  return o.transactions.every(isRecentTxApiRow)
}

function inferAmountToneFromAmount(amountStr: string): RecentTx['amountTone'] {
  const s = amountStr.trim()
  if (s.startsWith('-') || s.startsWith('(')) return 'negative'
  if (s.startsWith('+')) return 'positive'
  return 'neutral'
}

function mapStrictApiRow(tx: RecentTxApi, index: number, explorerBase: string | null): RecentTx {
  const contract = tx.contract_address.trim()
  const walletShort = isHexAddress(contract) ? shortEthAddress(contract) : contract || '—'
  const txHashRaw = typeof tx.transaction_hash === 'string' ? tx.transaction_hash : ''
  const txHashNorm = normalizeEthereumTxHash(txHashRaw)
  const walletExplorerHref =
    explorerBase && txHashNorm ? blockExplorerTxUrl(explorerBase, txHashNorm) : null

  const amountStr = displayDashboardMetricString(tx.amount)
  const amountTone: RecentTx['amountTone'] =
    tx.amount < 0 ? 'negative' : tx.amount > 0 ? 'positive' : 'neutral'

  const id = txHashNorm ?? `${index}-${contract}-${tx.time_since}`

  return {
    id,
    walletShort,
    type: tx.transaction_type.trim() || '—',
    amount: amountStr === '—' ? String(tx.amount) : amountStr,
    amountTone,
    timeAgo: tx.time_since.trim() || '—',
    walletExplorerHref: walletExplorerHref ?? undefined,
  }
}

function parseStrictRecentTxResponse(json: RecentTxResponse): RecentPayoutBundle {
  const envelope = extractContractAndExplorer(json)
  const explorerBase = envelope.explorerBaseUrl || getDefaultSepoliaBlockExplorerBase()

  const firstRowContract = json.transactions.find((t) => isHexAddress(t.contract_address))?.contract_address.trim()
  const contractAddress =
    envelope.contractAddress ?? (firstRowContract && isHexAddress(firstRowContract) ? firstRowContract : null) ??
    getDefaultSepoliaPoolContractAddress()

  const transactions = json.transactions.map((row, i) => mapStrictApiRow(row, i, explorerBase))

  return {
    transactions,
    contractAddress,
    explorerBaseUrl: explorerBase,
  }
}

function inferAmountTone(amount: string, raw: Record<string, unknown>): RecentTx['amountTone'] {
  const d = raw.direction ?? raw.amount_direction ?? raw.flow
  if (typeof d === 'string') {
    const x = d.toLowerCase()
    if (['credit', 'in', 'positive', 'deposit', 'inbound'].includes(x)) return 'positive'
    if (['debit', 'out', 'negative', 'withdraw', 'outbound'].includes(x)) return 'negative'
  }
  return inferAmountToneFromAmount(amount)
}

function mapLegacyRowToRecentTx(raw: unknown, index: number, explorerBase: string | null): RecentTx | null {
  const r = asRecord(raw)
  if (!r) return null

  const contractFull =
    pickString(r, ['contract_address', 'pool_contract_address', 'smart_contract_address']) ||
    pickString(r, ['lending_pool_contract_address']) ||
    ''

  const walletFull =
    pickString(r, [
      'wallet_address',
      'wallet',
      'signer_address',
      'from_address',
      'from',
      'address',
      'user_wallet',
      'account',
    ]) || ''

  const id =
    pickString(r, ['id', 'pk', 'transaction_id', 'tx_id', 'uuid']) ||
    pickString(r, ['tx_hash', 'transaction_hash', 'hash']) ||
    String(index)

  const type = pickString(r, ['type', 'transaction_type', 'kind', 'label', 'description']) || '—'

  let amount =
    pickString(r, ['amount', 'amount_display', 'value', 'value_display', 'formatted_amount']) || ''
  if (!amount && typeof r.amount === 'number' && Number.isFinite(r.amount)) {
    amount = displayDashboardMetricString(r.amount)
  }
  if (!amount) amount = '—'

  const timeAgo =
    pickString(r, ['time_since', 'time_ago', 'relative_time', 'display_time', 'created_at_display']) ||
    pickString(r, ['created_at', 'timestamp', 'occurred_at']) ||
    '—'

  const txHashRaw = pickString(r, ['transaction_hash', 'tx_hash', 'transactionHash'])
  const txHashNorm = normalizeEthereumTxHash(txHashRaw)

  const linkTarget = contractFull && isHexAddress(contractFull) ? contractFull : walletFull
  const walletShort =
    linkTarget && isHexAddress(linkTarget)
      ? shortEthAddress(linkTarget)
      : pickString(r, ['wallet_short', 'wallet_display']) || (linkTarget ? linkTarget : '—')

  const walletExplorerHref =
    explorerBase && txHashNorm
      ? blockExplorerTxUrl(explorerBase, txHashNorm)
      : explorerBase && linkTarget && isHexAddress(linkTarget)
        ? blockExplorerAddressUrl(explorerBase, linkTarget)
        : null

  return {
    id,
    walletShort,
    type,
    amount,
    amountTone: inferAmountTone(amount, r),
    timeAgo,
    walletExplorerHref: walletExplorerHref ?? undefined,
  }
}

export type RecentPayoutBundle = {
  transactions: RecentTx[]
  contractAddress: string | null
  explorerBaseUrl: string | null
}

export function parseRecentPayoutResponse(json: unknown): RecentPayoutBundle {
  if (isRecentTxResponseShape(json)) {
    return parseStrictRecentTxResponse(json)
  }

  const rows = extractTransactionRows(json)
  const meta = extractContractAndExplorer(json)
  const explorerBase = meta.explorerBaseUrl || getDefaultSepoliaBlockExplorerBase()
  const contractAddress = meta.contractAddress || getDefaultSepoliaPoolContractAddress()

  const transactions: RecentTx[] = []
  rows.forEach((row, i) => {
    const tx = mapLegacyRowToRecentTx(row, i, explorerBase)
    if (tx) transactions.push(tx)
  })

  return {
    transactions,
    contractAddress,
    explorerBaseUrl: explorerBase,
  }
}

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const t = typeof accessToken === 'string' ? accessToken.trim() : ''
  if (!t) throw new Error('Missing access token for payout API request.')
  return {
    Accept: 'application/json',
    Authorization: `Token ${t}`,
  }
}

export async function fetchRecentPayoutTransactions(accessToken: string | null | undefined): Promise<RecentPayoutBundle> {
  const base = requireApiBaseUrl()
  const res = await fetchWithAuthRecovery(`${base}${RECENT_TRANSACTIONS_PATH}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  const json = await parseJsonResponse<unknown>(res)
  return parseRecentPayoutResponse(json)
}
