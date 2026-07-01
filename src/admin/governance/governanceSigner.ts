import type { ProposalStatus } from '@/api/types/multisig'

const SIGNABLE_GOVERNANCE_STATUSES: readonly ProposalStatus[] = ['pending_signatures', 'ready']

export function isSignableGovernanceProposalStatus(status: ProposalStatus): boolean {
  return SIGNABLE_GOVERNANCE_STATUSES.includes(status)
}

export function isGovernanceSignerAddress(
  address: string | null | undefined,
  signers: readonly string[],
): boolean {
  if (!address?.trim() || signers.length === 0) return false
  const lower = address.trim().toLowerCase()
  return signers.some((s) => s.toLowerCase() === lower)
}

export function hasGovernanceSignature(
  address: string | null | undefined,
  signedAddresses: readonly string[],
): boolean {
  if (!address?.trim()) return false
  const lower = address.trim().toLowerCase()
  return signedAddresses.some((s) => s.toLowerCase() === lower)
}

export type CanSignGovernanceProposalInput = {
  status: ProposalStatus
  missingSigners: readonly string[]
  walletAddress: string | null | undefined
  multisigSigners: readonly string[]
  /** When provided, suppresses sign if this wallet already signed. */
  signedAddresses?: readonly string[]
  isConnected?: boolean
}

/** True when the connected wallet may submit a new signature for this proposal. */
export function canUserSignGovernanceProposal(input: CanSignGovernanceProposalInput): boolean {
  const {
    status,
    missingSigners,
    walletAddress,
    multisigSigners,
    signedAddresses,
    isConnected = true,
  } = input

  if (!isConnected || !walletAddress?.trim()) return false
  if (!isSignableGovernanceProposalStatus(status)) return false
  if (!isGovernanceSignerAddress(walletAddress, multisigSigners)) return false

  if (signedAddresses?.length && hasGovernanceSignature(walletAddress, signedAddresses)) {
    return false
  }

  if (missingSigners.length === 0) return false

  const walletLower = walletAddress.trim().toLowerCase()
  return missingSigners.some((s) => s.toLowerCase() === walletLower)
}
