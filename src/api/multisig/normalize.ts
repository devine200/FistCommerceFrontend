import {
  MULTISIG_OPERATION_TYPES,
  type BackendKeyAlignment,
  type MultisigConfig,
  type MultisigPrecondition,
  type MultisigProposalCall,
  type MultisigProposalSignature,
  type MultisigSignerMgmtSync,
  type OperationType,
  type ProposalDetail,
  type ProposalListRow,
  type ProposalStatus,
  type SigningPayload,
} from '@/api/types/multisig'

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

function pickNullableStr(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key]
    if (v === null) return null
    if (typeof v === 'string') return v.trim() || null
  }
  return null
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = record[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

const OPERATION_TYPE_LOOKUP = new Set<string>(MULTISIG_OPERATION_TYPES)

/**
 * Maps a backend operation type (underscore or hyphen form) to a known {@link OperationType}.
 * Unrecognized values fall back to `'unknown'` — never to a real op — so a newly added backend
 * type is shown neutrally rather than being silently mislabeled as another action.
 */
export function normalizeOperationType(raw: string): OperationType {
  const t = raw.trim().toLowerCase().replace(/-/g, '_')
  return OPERATION_TYPE_LOOKUP.has(t) ? (t as OperationType) : 'unknown'
}

function normalizeProposalStatus(raw: string): ProposalStatus {
  const t = raw.trim().toLowerCase()
  if (t === 'ready') return 'ready'
  if (t === 'executed') return 'executed'
  if (t === 'failed') return 'failed'
  if (t === 'cancelled' || t === 'canceled') return 'cancelled'
  return 'pending_signatures'
}

function normalizeCall(raw: unknown): MultisigProposalCall | null {
  const r = asRecord(raw)
  const target = pickStr(r, 'target')
  const calldata = pickStr(r, 'calldata')
  if (!target && !calldata) return null
  const decodedRaw = r.decodedArgs ?? r.decoded_args
  const decodedArgs =
    decodedRaw && typeof decodedRaw === 'object' && !Array.isArray(decodedRaw)
      ? (decodedRaw as Record<string, unknown>)
      : undefined
  const contract = pickStr(r, 'contract') || undefined
  const fn = pickStr(r, 'function') || undefined
  return { target, calldata, decodedArgs, contract, function: fn }
}

function normalizeSignature(raw: unknown): MultisigProposalSignature | null {
  const r = asRecord(raw)
  const signerAddress = pickStr(r, 'signerAddress', 'signer_address')
  const signedAt = pickStr(r, 'signedAt', 'signed_at')
  if (!signerAddress) return null
  return { signerAddress, signedAt }
}

function normalizePrecondition(raw: unknown): MultisigPrecondition | null {
  const r = asRecord(raw)
  if (!Object.keys(r).length) return null
  return {
    ok: pickBool(r, 'ok'),
    label: pickStr(r, 'label') || undefined,
    error: pickStr(r, 'error') || undefined,
  }
}

export function normalizeMultisigConfig(raw: unknown): MultisigConfig {
  const r = asRecord(raw)
  const signers: string[] = []
  const signersRaw = r.signers
  if (Array.isArray(signersRaw)) {
    for (const s of signersRaw) {
      if (typeof s === 'string' && s.trim()) signers.push(s.trim())
    }
  }
  return {
    chainId: pickNumber(r, 'chainId', 'chain_id'),
    multisigAddress: pickStr(r, 'multisigAddress', 'multisig_address'),
    threshold: pickNumber(r, 'threshold'),
    signerCount: pickNumber(r, 'signerCount', 'signer_count') || signers.length,
    signers,
    handoffCompleted: pickBool(r, 'handoffCompleted', 'handoff_completed') || undefined,
    servicerAddress: pickStr(r, 'servicerAddress', 'servicer_address') || undefined,
  }
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((s) => s.trim())
}

function normalizeBackendKeyAlignment(raw: unknown): BackendKeyAlignment {
  const r = asRecord(raw)
  return {
    alignedBackendKeys: normalizeStringArray(r.alignedBackendKeys ?? r.aligned_backend_keys),
    misalignedBackendKeys: normalizeStringArray(r.misalignedBackendKeys ?? r.misaligned_backend_keys),
    allAligned: pickBool(r, 'allAligned', 'all_aligned'),
  }
}

export function normalizeMultisigSignerMgmtSync(raw: unknown): MultisigSignerMgmtSync | null {
  const r = asRecord(raw)
  const mgmt = asRecord(r.multisigSignerMgmt ?? r.multisig_signer_mgmt)
  if (!Object.keys(mgmt).length) return null
  const configRaw = mgmt.multisigConfig ?? mgmt.multisig_config
  if (!configRaw) return null
  return {
    multisigConfig: normalizeMultisigConfig(configRaw),
    backendKeyAlignment: normalizeBackendKeyAlignment(
      mgmt.backendKeyAlignment ?? mgmt.backend_key_alignment,
    ),
  }
}

export function normalizeProposalListRow(raw: unknown): ProposalListRow | null {
  const r = asRecord(raw)
  const id = pickStr(r, 'id')
  if (!id) return null

  const missingSigners: string[] = []
  const missingRaw = r.missingSigners ?? r.missing_signers
  if (Array.isArray(missingRaw)) {
    for (const s of missingRaw) {
      if (typeof s === 'string' && s.trim()) missingSigners.push(s.trim())
    }
  }

  return {
    id,
    operationType: normalizeOperationType(pickStr(r, 'operationType', 'operation_type')),
    status: normalizeProposalStatus(pickStr(r, 'status')),
    summary: pickStr(r, 'summary') || 'Governance proposal',
    relatedType: pickNullableStr(r, 'relatedType', 'related_type'),
    relatedId: pickNullableStr(r, 'relatedId', 'related_id'),
    executionTxHash: pickNullableStr(r, 'executionTxHash', 'execution_tx_hash'),
    createdAt: pickStr(r, 'createdAt', 'created_at'),
    missingSigners,
    validSignatureCount: pickNumber(r, 'validSignatureCount', 'valid_signature_count'),
    threshold: pickNumber(r, 'threshold'),
  }
}

export function normalizeProposalDetail(raw: unknown): ProposalDetail | null {
  const r = asRecord(raw)
  const id = pickStr(r, 'id')
  if (!id) return null

  const calls: MultisigProposalCall[] = []
  const callsRaw = r.calls
  if (Array.isArray(callsRaw)) {
    for (const item of callsRaw) {
      const call = normalizeCall(item)
      if (call) calls.push(call)
    }
  }

  const signatures: MultisigProposalSignature[] = []
  const sigsRaw = r.signatures
  if (Array.isArray(sigsRaw)) {
    for (const item of sigsRaw) {
      const sig = normalizeSignature(item)
      if (sig) signatures.push(sig)
    }
  }

  const preconditions: MultisigPrecondition[] = []
  const preRaw = r.preconditions
  if (Array.isArray(preRaw)) {
    for (const item of preRaw) {
      const row = normalizePrecondition(item)
      if (row) preconditions.push(row)
    }
  }

  const missingSigners: string[] = []
  const missingRaw = r.missingSigners ?? r.missing_signers
  if (Array.isArray(missingRaw)) {
    for (const s of missingRaw) {
      if (typeof s === 'string' && s.trim()) missingSigners.push(s.trim())
    }
  }

  return {
    id,
    operationType: normalizeOperationType(pickStr(r, 'operationType', 'operation_type')),
    status: normalizeProposalStatus(pickStr(r, 'status')),
    summary: pickStr(r, 'summary') || 'Governance proposal',
    calls,
    signatures,
    validSignatureCount: pickNumber(r, 'validSignatureCount', 'valid_signature_count'),
    missingSigners,
    readyToExecute: pickBool(r, 'readyToExecute', 'ready_to_execute'),
    simulationError: pickNullableStr(r, 'simulationError', 'simulation_error'),
    preconditions,
    executionTxHash: pickNullableStr(r, 'executionTxHash', 'execution_tx_hash'),
    relatedType: pickNullableStr(r, 'relatedType', 'related_type'),
    relatedId: pickNullableStr(r, 'relatedId', 'related_id'),
    threshold: pickNumber(r, 'threshold'),
    multisigAddress: pickStr(r, 'multisigAddress', 'multisig_address'),
    createdAt: pickStr(r, 'createdAt', 'created_at'),
  }
}

export function normalizeSigningPayload(raw: unknown): SigningPayload | null {
  const r = asRecord(raw)
  const proposalId = pickStr(r, 'proposalId', 'proposal_id')
  const digestRaw = pickStr(r, 'digestToSign', 'digest_to_sign')
  if (!proposalId || !digestRaw) return null
  const digestToSign = (digestRaw.startsWith('0x') ? digestRaw : `0x${digestRaw}`) as `0x${string}`

  const signers: string[] = []
  if (Array.isArray(r.signers)) {
    for (const s of r.signers) {
      if (typeof s === 'string' && s.trim()) signers.push(s.trim())
    }
  }

  const calls: MultisigProposalCall[] = []
  const callsRaw = r.calls
  if (Array.isArray(callsRaw)) {
    for (const item of callsRaw) {
      const call = normalizeCall(item)
      if (call) calls.push(call)
    }
  }

  return {
    proposalId,
    digestToSign,
    chainId: pickNumber(r, 'chainId', 'chain_id'),
    nonce: pickNumber(r, 'nonce'),
    multisigAddress: pickStr(r, 'multisigAddress', 'multisig_address'),
    threshold: pickNumber(r, 'threshold'),
    signers,
    signingNote: pickStr(r, 'signingNote', 'signing_note'),
    calls,
  }
}

export function operationTypeLabel(type: OperationType): string {
  switch (type) {
    case 'withdrawal_approve':
      return 'Withdrawal approval'
    case 'withdrawal_reject':
      return 'Withdrawal rejection'
    case 'loan_fund':
      return 'Fund loan'
    case 'loan_reject_funded':
      return 'Reject funded loan'
    case 'payout_receivable':
      return 'Funding payout'
    case 'kyc_status':
      return 'KYC status'
    case 'risk_tier':
      return 'Risk tier'
    case 'multisig_add_signers':
      return 'Add multisig owner'
    case 'multisig_remove_signers':
      return 'Remove multisig owner'
    case 'multisig_set_threshold':
      return 'Change multisig threshold'
    case 'multisig_signer_rotation':
      return 'Rotate multisig owners'
    case 'unknown':
      return 'Governance proposal'
    default:
      return 'Governance proposal'
  }
}

export function proposalStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'ready':
      return 'Ready to execute'
    case 'executed':
      return 'Executed'
    case 'failed':
      return 'Failed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Pending signatures'
  }
}
