import { parseApiErrorResponse } from '@/api/client'
import { normalizeOperationType } from '@/api/multisig/normalize'
import type { OperationType } from '@/api/types/multisig'

export type ServicerWalletSnapshot = {
  address: string
  nativeBalanceWei: string
}

export type AdminWriteOutcome =
  | {
      kind: 'completed'
      status: 200 | 201
      message: string
      txHash?: string
      servicerGasWarning?: string
      servicerWallet?: ServicerWalletSnapshot
      postExecuteSync?: unknown
      raw: Record<string, unknown>
    }
  | {
      kind: 'governance_queued'
      status: 202
      message: string
      proposalId: string
      proposalDetailUrl?: string
      operationType?: OperationType
      raw: Record<string, unknown>
    }
  | {
      kind: 'proposal_created'
      status: 201
      message: string
      proposalId: string
      proposalDetailUrl?: string
      operationType?: OperationType
      raw: Record<string, unknown>
    }

export const ADMIN_GOVERNANCE_BASE_PATH = '/dashboard/admin/governance'

export function adminGovernanceProposalPath(proposalId: string): string {
  const id = proposalId.trim()
  if (!id) return ADMIN_GOVERNANCE_BASE_PATH
  return `${ADMIN_GOVERNANCE_BASE_PATH}/${encodeURIComponent(id)}`
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function pickStr(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function pickProposalId(record: Record<string, unknown>): string {
  return pickStr(record, 'proposalId', 'proposal_id', 'id')
}

/** Backend attaches `operationType` to multisig proposal responses; absent on 200 bypass. */
function pickOperationType(record: Record<string, unknown>): OperationType | undefined {
  const raw = pickStr(record, 'operationType', 'operation_type')
  return raw ? normalizeOperationType(raw) : undefined
}

function pickMessage(record: Record<string, unknown>, fallback: string): string {
  return pickStr(record, 'message', 'errorMessage', 'error') || fallback
}

function normalizeServicerWallet(raw: unknown): ServicerWalletSnapshot | undefined {
  const r = asRecord(raw)
  const address = pickStr(r, 'address')
  const nativeBalanceWei = pickStr(r, 'nativeBalanceWei', 'native_balance_wei')
  if (!address && !nativeBalanceWei) return undefined
  return { address, nativeBalanceWei }
}

function pickTxHash(record: Record<string, unknown>): string | undefined {
  const h = pickStr(record, 'tx_hash', 'txHash', 'transaction_hash', 'transactionHash')
  return h || undefined
}

/** Parse admin write responses that may be 200 (done), 201/202 (governance), or error. */
export async function parseAdminWriteResponse(res: Response): Promise<AdminWriteOutcome> {
  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    if (!res.ok) {
      throw await parseApiErrorResponse(res)
    }
    return {
      kind: 'completed',
      status: 200,
      message: res.statusText || 'Request completed.',
      raw: {},
    }
  }

  const data = asRecord(raw)

  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }

  if (res.status === 202) {
    const proposalId = pickProposalId(data)
    if (!proposalId) {
      throw new Error(pickMessage(data, 'Governance response was missing proposalId.'))
    }
    return {
      kind: 'governance_queued',
      status: 202,
      message: pickMessage(data, 'Sent to multisig queue.'),
      proposalId,
      proposalDetailUrl: pickStr(data, 'proposalDetailUrl', 'proposal_detail_url') || undefined,
      operationType: pickOperationType(data),
      raw: data,
    }
  }

  if (res.status === 201) {
    const proposalId = pickProposalId(data)
    if (proposalId) {
      return {
        kind: 'proposal_created',
        status: 201,
        message: pickMessage(data, 'Multisig proposal created.'),
        proposalId,
        proposalDetailUrl: pickStr(data, 'proposalDetailUrl', 'proposal_detail_url') || undefined,
        operationType: pickOperationType(data),
        raw: data,
      }
    }

    return {
      kind: 'completed',
      status: 201,
      message: pickMessage(data, 'Request completed.'),
      txHash: pickTxHash(data),
      servicerGasWarning: pickStr(data, 'servicerGasWarning', 'servicer_gas_warning') || undefined,
      servicerWallet: normalizeServicerWallet(data.servicerWallet ?? data.servicer_wallet),
      postExecuteSync: data.postExecuteSync ?? data.post_execute_sync,
      raw: data,
    }
  }

  return {
    kind: 'completed',
    status: 200,
    message: pickMessage(data, 'Request completed.'),
    txHash: pickTxHash(data),
    servicerGasWarning: pickStr(data, 'servicerGasWarning', 'servicer_gas_warning') || undefined,
    servicerWallet: normalizeServicerWallet(data.servicerWallet ?? data.servicer_wallet),
    postExecuteSync: data.postExecuteSync ?? data.post_execute_sync,
    raw: data,
  }
}
