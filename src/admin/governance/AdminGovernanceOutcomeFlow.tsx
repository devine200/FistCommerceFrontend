import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { adminGovernanceProposalPath } from '@/api/adminActionResponse'
import { operationTypeLabel } from '@/api/multisig/normalize'
import { fetchMultisigProposalDetail } from '@/api/multisig/proposals'
import { getDefaultBlockExplorerBase, blockExplorerTxUrl } from '@/api/payout'
import { canUserSignGovernanceProposal } from '@/admin/governance/governanceSigner'
import { useGovernanceSignAndSubmit } from '@/admin/governance/useGovernanceSignAndSubmit'
import type { ResolvedGovernanceOutcome } from '@/admin/governance/types'
import type { ProposalStatus } from '@/api/types/multisig'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshMultisigConfig } from '@/store/slices/adminMultisigSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'

const overlayClass =
  'fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5'

const PROPOSAL_CREATED_NOTE =
  'Multisig owners must sign this proposal before it can be executed on-chain. Review the proposal to inspect the encoded calls.'

type AdminGovernanceOutcomeFlowProps = {
  open: boolean
  outcome: ResolvedGovernanceOutcome | null
  onClose: () => void
}

export function AdminGovernanceOutcomeFlow({ open, outcome, onClose }: AdminGovernanceOutcomeFlowProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const { config } = useAppSelector((s) => s.adminMultisig)
  const { address, isConnected } = useActiveWallet()
  const { signAndSubmit, pending, error, clearError } = useGovernanceSignAndSubmit()
  const [signProgress, setSignProgress] = useState<{
    validSignatureCount: number
    threshold: number
    readyToExecute: boolean
  } | null>(null)
  const [proposalSnapshot, setProposalSnapshot] = useState<{
    status: ProposalStatus
    missingSigners: string[]
    signedAddresses: string[]
    validSignatureCount: number
    threshold: number
  } | null>(null)

  useEffect(() => {
    if (!open || outcome?.kind !== 'proposal_queued') return
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    void dispatch(refreshMultisigConfig())
  }, [open, outcome?.kind, accessToken, sessionKind, dispatch])

  useEffect(() => {
    if (!open) {
      setSignProgress(null)
      setProposalSnapshot(null)
      clearError()
    }
  }, [open, clearError])

  const proposalId = outcome?.kind === 'proposal_queued' ? outcome.proposalId : null

  useEffect(() => {
    if (!open || !proposalId || !accessToken?.trim()) {
      setProposalSnapshot(null)
      return
    }
    let cancelled = false
    void fetchMultisigProposalDetail(accessToken, proposalId)
      .then((detail) => {
        if (cancelled) return
        setProposalSnapshot({
          status: detail.status,
          missingSigners: detail.missingSigners,
          signedAddresses: detail.signatures.map((s) => s.signerAddress),
          validSignatureCount: detail.validSignatureCount,
          threshold: detail.threshold,
        })
      })
      .catch(() => {
        if (!cancelled) setProposalSnapshot(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, proposalId, accessToken])

  const canSignNow = useMemo(() => {
    if (!proposalId || signProgress?.readyToExecute || !proposalSnapshot) return false
    return canUserSignGovernanceProposal({
      status: proposalSnapshot.status,
      missingSigners: proposalSnapshot.missingSigners,
      walletAddress: address,
      multisigSigners: config?.signers ?? [],
      signedAddresses: proposalSnapshot.signedAddresses,
      isConnected,
    })
  }, [
    proposalId,
    signProgress?.readyToExecute,
    proposalSnapshot,
    address,
    config?.signers,
    isConnected,
  ])

  if (!open || !outcome) return null

  const explorerBase = getDefaultBlockExplorerBase()
  const txUrl =
    outcome.kind === 'direct_complete' && outcome.txHash && explorerBase
      ? blockExplorerTxUrl(explorerBase, outcome.txHash)
      : null

  const title =
    outcome.kind === 'proposal_queued'
      ? signProgress?.readyToExecute
        ? 'Threshold met'
        : signProgress
          ? 'Signature recorded'
          : 'Proposal created'
      : 'Request completed'

  const proposalDescription =
    outcome.kind === 'proposal_queued' && !signProgress
      ? [outcome.message.trim(), PROPOSAL_CREATED_NOTE].filter(Boolean).join('\n\n')
      : outcome.message

  const handleSignNow = async () => {
    if (!proposalId) return
    const result = await signAndSubmit(proposalId)
    if (!result) return
    setSignProgress({
      validSignatureCount: result.validSignatureCount,
      threshold: result.threshold,
      readyToExecute: result.readyToExecute,
    })
    setProposalSnapshot((prev) =>
      prev && address
        ? {
            ...prev,
            signedAddresses: prev.signedAddresses.some(
              (s) => s.toLowerCase() === address.toLowerCase(),
            )
              ? prev.signedAddresses
              : [...prev.signedAddresses, address],
            missingSigners: prev.missingSigners.filter(
              (s) => s.toLowerCase() !== address.toLowerCase(),
            ),
          }
        : prev,
    )
  }

  return (
    <div className={overlayClass} role="dialog" aria-modal="true" aria-labelledby="gov-outcome-title">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h3 id="gov-outcome-title" className="text-[#0B1220] text-[18px] font-bold">
          {title}
        </h3>
        {outcome.kind === 'proposal_queued' && outcome.operationType ? (
          <p className="mt-1 text-[#195EBC] text-[13px] font-semibold">
            {operationTypeLabel(outcome.operationType)}
          </p>
        ) : null}
        <p className="mt-2 text-[#6B7488] text-[14px] leading-relaxed whitespace-pre-line">
          {outcome.kind === 'proposal_queued' ? proposalDescription : outcome.message}
        </p>

        {outcome.kind === 'direct_complete' && outcome.servicerGasWarning ? (
          <p className="mt-3 text-[#92400E] text-[13px] rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2">
            {outcome.servicerGasWarning}
          </p>
        ) : null}

        {txUrl ? (
          <p className="mt-3 text-[14px]">
            <a href={txUrl} target="_blank" rel="noopener noreferrer" className="text-[#195EBC] hover:underline">
              View transaction
            </a>
          </p>
        ) : null}

        {outcome.kind === 'proposal_queued' && !signProgress && proposalSnapshot ? (
          <p className="mt-3 text-[#0B1220] text-[14px] font-medium">
            Signatures: {proposalSnapshot.validSignatureCount} / {proposalSnapshot.threshold}
            {proposalSnapshot.missingSigners.length > 0
              ? ` — awaiting ${proposalSnapshot.missingSigners.length} more owner${
                  proposalSnapshot.missingSigners.length === 1 ? '' : 's'
                }.`
              : ' — threshold met; execute on the proposal page.'}
          </p>
        ) : null}

        {signProgress ? (
          <p className="mt-3 text-[#0B1220] text-[14px] font-medium">
            Signatures: {signProgress.validSignatureCount} / {signProgress.threshold}
            {signProgress.readyToExecute ? ' — ready to execute on the proposal page.' : ''}
          </p>
        ) : null}

        {!isConnected && outcome.kind === 'proposal_queued' ? (
          <p className="mt-3 text-[#6B7488] text-[13px]">
            Connect your multisig owner wallet in the top bar to sign now.
          </p>
        ) : null}

        {isConnected && outcome.kind === 'proposal_queued' && proposalSnapshot && !canSignNow && !signProgress ? (
          <p className="mt-3 text-[#6B7488] text-[13px]">
            {proposalSnapshot.signedAddresses.some(
              (s) => address && s.toLowerCase() === address.toLowerCase(),
            )
              ? 'You have already signed this proposal.'
              : 'Connected wallet is not a multisig signer. Another owner must sign this proposal.'}
          </p>
        ) : null}

        {error ? <p className="mt-3 text-[#DC2626] text-[14px]">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-2">
          {proposalId ? (
            <button
              type="button"
              onClick={() => {
                navigate(adminGovernanceProposalPath(proposalId))
                onClose()
              }}
              className="h-11 rounded-[8px] bg-[#195EBC] text-white text-[14px] font-semibold hover:bg-[#154a9a] transition-colors"
            >
              Review proposal
            </button>
          ) : null}
          {outcome.kind === 'proposal_queued' && canSignNow && !signProgress?.readyToExecute ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void handleSignNow()}
              className="h-11 rounded-[8px] border border-[#195EBC] text-[#195EBC] text-[14px] font-semibold hover:bg-[#E8EFFB] disabled:opacity-50"
            >
              {pending ? 'Signing…' : 'Sign now'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="h-10 text-[#6B7488] text-[14px] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
