const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function isValidEthAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim())
}

export function isZeroAddress(addr: string): boolean {
  return addr.trim().toLowerCase() === ZERO_ADDRESS
}

export function normalizeEthAddress(addr: string): string {
  return addr.trim()
}

export type SignerRotationDraft = {
  addAddresses: string[]
  removeAddresses: string[]
  threshold: number
}

export function computeProjectedSignerCount(
  currentSigners: readonly string[],
  addAddresses: readonly string[],
  removeAddresses: readonly string[],
): number {
  const currentLower = new Set(currentSigners.map((a) => a.toLowerCase()))
  const removeLower = new Set(removeAddresses.map((a) => a.toLowerCase()))
  const netAdds = addAddresses.filter((a) => {
    const low = a.toLowerCase()
    return !currentLower.has(low) && !removeLower.has(low)
  })
  const remaining = currentSigners.filter((a) => !removeLower.has(a.toLowerCase()))
  return remaining.length + netAdds.length
}

export function validateSignerRotationDraft(
  draft: SignerRotationDraft,
  currentSigners: readonly string[],
  currentThreshold: number,
): { ok: true } | { ok: false; message: string } {
  const addLower = draft.addAddresses.map((a) => a.toLowerCase())
  const removeLower = draft.removeAddresses.map((a) => a.toLowerCase())

  for (const addr of [...draft.addAddresses, ...draft.removeAddresses]) {
    if (!isValidEthAddress(addr)) {
      return { ok: false, message: `Invalid address: ${addr || '(empty)'}` }
    }
    if (isZeroAddress(addr)) {
      return { ok: false, message: 'Zero address is not allowed.' }
    }
  }

  const overlap = addLower.find((a) => removeLower.includes(a))
  if (overlap) {
    return { ok: false, message: 'An address cannot be both added and removed.' }
  }

  const projected = computeProjectedSignerCount(currentSigners, draft.addAddresses, draft.removeAddresses)

  if (draft.addAddresses.length === 0 && draft.removeAddresses.length === 0 && draft.threshold === currentThreshold) {
    return { ok: false, message: 'No signer changes to submit.' }
  }

  if (projected < 1) {
    return { ok: false, message: 'At least one signer must remain after this change.' }
  }

  if (!Number.isInteger(draft.threshold) || draft.threshold < 1) {
    return { ok: false, message: 'Threshold must be a positive integer.' }
  }

  if (draft.threshold > projected) {
    return { ok: false, message: `Threshold cannot exceed projected signer count (${projected}).` }
  }

  const uniqueAdds = new Set(addLower)
  if (uniqueAdds.size !== addLower.length) {
    return { ok: false, message: 'Duplicate addresses in add list.' }
  }

  const uniqueRemoves = new Set(removeLower)
  if (uniqueRemoves.size !== removeLower.length) {
    return { ok: false, message: 'Duplicate addresses in remove list.' }
  }

  for (const addr of draft.addAddresses) {
    if (currentSigners.some((s) => s.toLowerCase() === addr.toLowerCase())) {
      return { ok: false, message: `${addr} is already a signer.` }
    }
  }

  for (const addr of draft.removeAddresses) {
    if (!currentSigners.some((s) => s.toLowerCase() === addr.toLowerCase())) {
      return { ok: false, message: `${addr} is not a current signer.` }
    }
  }

  return { ok: true }
}

export function validateAddSignersOnly(
  addresses: readonly string[],
  currentSigners: readonly string[],
  currentThreshold: number,
): { ok: true } | { ok: false; message: string } {
  if (!addresses.length) {
    return { ok: false, message: 'Add at least one owner address.' }
  }
  return validateSignerRotationDraft(
    { addAddresses: [...addresses], removeAddresses: [], threshold: currentThreshold },
    currentSigners,
    currentThreshold,
  )
}

export function validateRemoveSignersOnly(
  addresses: readonly string[],
  currentSigners: readonly string[],
  currentThreshold: number,
): { ok: true } | { ok: false; message: string } {
  if (!addresses.length) {
    return { ok: false, message: 'Select at least one owner to remove.' }
  }
  const projected = computeProjectedSignerCount(currentSigners, [], addresses)
  const effectiveThreshold = Math.min(currentThreshold, projected)
  return validateSignerRotationDraft(
    { addAddresses: [], removeAddresses: [...addresses], threshold: effectiveThreshold },
    currentSigners,
    currentThreshold,
  )
}

export function validateThresholdOnly(
  threshold: number,
  currentSigners: readonly string[],
  currentThreshold: number,
): { ok: true } | { ok: false; message: string } {
  if (threshold === currentThreshold) {
    return { ok: false, message: 'Threshold is unchanged.' }
  }
  return validateSignerRotationDraft(
    { addAddresses: [], removeAddresses: [], threshold },
    currentSigners,
    currentThreshold,
  )
}
