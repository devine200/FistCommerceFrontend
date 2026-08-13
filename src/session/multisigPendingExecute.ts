/** Persist a mined handleOps hash until confirm-execute succeeds. */

const STORAGE_KEY = 'fist.multisig.pendingExecute.v1'

export type MultisigPendingExecute = {
  proposalId: string
  txHash: string
  chainId: number
  savedAt: number
}

function readAll(): Record<string, MultisigPendingExecute> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw?.trim()) return {}
    const parsed = JSON.parse(raw) as Record<string, MultisigPendingExecute>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, MultisigPendingExecute>): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / private mode
  }
}

export function getMultisigPendingExecute(proposalId: string): MultisigPendingExecute | null {
  const id = proposalId.trim()
  if (!id) return null
  const row = readAll()[id]
  if (!row?.txHash?.trim()) return null
  return row
}

export function setMultisigPendingExecute(pending: MultisigPendingExecute): void {
  const id = pending.proposalId.trim()
  if (!id || !pending.txHash.trim()) return
  const map = readAll()
  map[id] = {
    proposalId: id,
    txHash: pending.txHash.trim(),
    chainId: pending.chainId,
    savedAt: pending.savedAt || Date.now(),
  }
  writeAll(map)
}

export function clearMultisigPendingExecute(proposalId: string): void {
  const id = proposalId.trim()
  if (!id) return
  const map = readAll()
  if (!(id in map)) return
  delete map[id]
  writeAll(map)
}
