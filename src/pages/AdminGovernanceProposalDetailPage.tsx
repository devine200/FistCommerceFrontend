import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import {
  governanceOperationLabel,
  governanceStatusPillVariant,
} from '@/components/admin/governance/adminGovernanceUi'
import {
  PrivilegedActionFeedbackLayer,
  type PrivilegedActionPhase,
} from '@/admin/governance/PrivilegedActionFeedbackLayer'
import { canUserSignGovernanceProposal, hasGovernanceSignature } from '@/admin/governance/governanceSigner'
import { useGovernanceSignAndSubmit } from '@/admin/governance/useGovernanceSignAndSubmit'
import { proposalStatusLabel } from '@/api/multisig/normalize'
import { getDefaultBlockExplorerBase, blockExplorerTxUrl } from '@/api/payout'
import { AdminPageFrame, AdminPanel, AdminStatusPill } from '@/components/admin/primitives'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  cancelMultisigProposal,
  clearAdminMultisigActionError,
  clearLastExecuteOutcome,
  executeMultisigProposal,
  refreshMultisigConfig,
  refreshMultisigProposalDetail,
  selectMultisigProposalDetail,
} from '@/store/slices/adminMultisigSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'

const GOVERNANCE_LIST_PATH = '/dashboard/admin/governance'
const DETAIL_POLL_MS = 15_000

function formatDecodedArgs(args?: Record<string, unknown>): string | null {
  if (!args || !Object.keys(args).length) return null
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    return null
  }
}

const AdminGovernanceProposalDetailPage = () => {
  const { proposalId } = useParams<{ proposalId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const { config, detailStatus, actionStatus, actionKind, actionError, lastExecuteOutcome } = useAppSelector(
    (s) => s.adminMultisig,
  )
  const detail = useAppSelector((s) =>
    proposalId ? selectMultisigProposalDetail(s.adminMultisig, proposalId) : null,
  )
  const { address, isConnected } = useActiveWallet()
  const { signAndSubmit, pending: signPending, error: signHookError, clearError: clearSignError } =
    useGovernanceSignAndSubmit()
  const [signingNote, setSigningNote] = useState<string | null>(null)

  useEffect(() => {
    if (!proposalId?.trim() || !accessToken?.trim() || sessionKind !== 'admin') return
    void dispatch(refreshMultisigConfig())
    void dispatch(refreshMultisigProposalDetail(proposalId))
  }, [dispatch, proposalId, accessToken, sessionKind])

  const shouldPollDetail = useMemo(() => {
    if (!detail) return false
    return detail.status === 'pending_signatures' || detail.status === 'ready'
  }, [detail])

  useEffect(() => {
    if (!proposalId?.trim() || !accessToken?.trim() || sessionKind !== 'admin' || !shouldPollDetail) {
      return
    }
    const id = window.setInterval(() => {
      void dispatch(refreshMultisigProposalDetail(proposalId))
    }, DETAIL_POLL_MS)
    return () => window.clearInterval(id)
  }, [dispatch, proposalId, accessToken, sessionKind, shouldPollDetail])

  const isSigner = useMemo(
    () => Boolean(address && (config?.signers ?? []).some((s) => s.toLowerCase() === address.toLowerCase())),
    [address, config?.signers],
  )

  const handleSign = useCallback(async () => {
    if (!proposalId) return
    const result = await signAndSubmit(proposalId)
    if (!result) return
    if (result.signingNote) setSigningNote(result.signingNote)
    await dispatch(refreshMultisigProposalDetail(proposalId)).unwrap()
  }, [proposalId, signAndSubmit, dispatch])

  const handleExecute = useCallback(() => {
    if (!proposalId) return
    void dispatch(executeMultisigProposal(proposalId))
  }, [dispatch, proposalId])

  const handleCancel = useCallback(() => {
    if (!proposalId) return
    if (!window.confirm('Cancel this governance proposal?')) return
    void dispatch(cancelMultisigProposal(proposalId))
  }, [dispatch, proposalId])

  const handleDismissActionFeedback = useCallback(() => {
    clearSignError()
    dispatch(clearAdminMultisigActionError())
  }, [clearSignError, dispatch])

  const handleRetryGovernanceAction = useCallback(() => {
    if (!proposalId) return
    if (signHookError) {
      void handleSign()
      return
    }
    if (actionKind === 'execute') {
      void dispatch(executeMultisigProposal(proposalId))
      return
    }
    if (actionKind === 'cancel') {
      if (!window.confirm('Cancel this governance proposal?')) return
      void dispatch(cancelMultisigProposal(proposalId))
    }
  }, [proposalId, signHookError, actionKind, handleSign, dispatch])

  const governanceFeedback = useMemo(() => {
    if (signPending) {
      return {
        phase: 'loading' as PrivilegedActionPhase,
        errorDescription: undefined as string | undefined,
        loadingTitle: 'Signing proposal',
        loadingDescription: 'Requesting signature payload and submitting your signature…',
        errorTitle: 'Unable to sign proposal',
        directSuccessTitle: 'Proposal signed',
      }
    }
    if (signHookError) {
      return {
        phase: 'failed' as PrivilegedActionPhase,
        errorDescription: signHookError,
        loadingTitle: 'Signing proposal',
        loadingDescription: '',
        errorTitle: 'Unable to sign proposal',
        directSuccessTitle: 'Proposal signed',
      }
    }
    if (actionKind === 'execute' || actionKind === 'cancel') {
      let phase: PrivilegedActionPhase = 'idle'
      if (actionStatus === 'loading' || actionStatus === 'failed') {
        phase = actionStatus
      } else if (actionKind === 'cancel' && actionStatus === 'succeeded') {
        phase = 'succeeded'
      }
      return {
        phase,
        errorDescription: actionError ?? undefined,
        loadingTitle: actionKind === 'execute' ? 'Executing proposal' : 'Cancelling proposal',
        loadingDescription:
          actionKind === 'execute'
            ? 'Submitting on-chain execution for this governance proposal…'
            : 'Cancelling this governance proposal…',
        errorTitle: actionKind === 'execute' ? 'Unable to execute proposal' : 'Unable to cancel proposal',
        directSuccessTitle: actionKind === 'execute' ? 'Proposal executed' : 'Proposal cancelled',
      }
    }
    return {
      phase: 'idle' as const,
      errorDescription: undefined,
      loadingTitle: '',
      loadingDescription: '',
      errorTitle: '',
      directSuccessTitle: '',
    }
  }, [signPending, signHookError, actionKind, actionStatus, actionError])

  if (!proposalId) {
    return <Navigate to={GOVERNANCE_LIST_PATH} replace />
  }

  const loading = detailStatus === 'loading' && !detail
  const explorerBase = getDefaultBlockExplorerBase()
  const txUrl =
    explorerBase && detail?.executionTxHash
      ? blockExplorerTxUrl(explorerBase, detail.executionTxHash)
      : null
  const executeTxHash =
    lastExecuteOutcome?.kind === 'completed' ? lastExecuteOutcome.txHash : undefined
  const executeTxUrl =
    explorerBase && executeTxHash ? blockExplorerTxUrl(explorerBase, executeTxHash) : null

  const alreadySigned = useMemo(() => {
    if (!address || !detail?.signatures?.length) return false
    return hasGovernanceSignature(
      address,
      detail.signatures.map((s) => s.signerAddress),
    )
  }, [address, detail?.signatures])

  const canSign = useMemo(
    () =>
      Boolean(detail) &&
      canUserSignGovernanceProposal({
        status: detail!.status,
        missingSigners: detail!.missingSigners,
        walletAddress: address,
        multisigSigners: config?.signers ?? [],
        signedAddresses: detail!.signatures.map((s) => s.signerAddress),
        isConnected,
      }) &&
      !signPending &&
      actionStatus !== 'loading',
    [detail, address, config?.signers, isConnected, signPending, actionStatus],
  )

  const canExecute =
    detail?.readyToExecute &&
    !detail.simulationError &&
    detail.status !== 'executed' &&
    detail.status !== 'cancelled' &&
    actionStatus !== 'loading'

  const canCancel =
    detail && detail.status !== 'executed' && detail.status !== 'cancelled' && actionStatus !== 'loading'

  const signatureProgress =
    detail && detail.threshold > 0
      ? Math.min(100, Math.round((detail.validSignatureCount / detail.threshold) * 100))
      : 0

  return (
    <AdminPageFrame>
      <PrivilegedActionFeedbackLayer
        phase={governanceFeedback.phase}
        resolvedOutcome={null}
        loadingTitle={governanceFeedback.loadingTitle}
        loadingDescription={governanceFeedback.loadingDescription}
        errorTitle={governanceFeedback.errorTitle}
        errorDescription={governanceFeedback.errorDescription}
        directSuccessTitle={governanceFeedback.directSuccessTitle}
        onDismiss={handleDismissActionFeedback}
        onRetry={handleRetryGovernanceAction}
      />

      <button
        type="button"
        onClick={() => navigate(GOVERNANCE_LIST_PATH)}
        className="text-[#195EBC] text-[14px] font-medium hover:underline w-fit"
      >
        ← Back to governance queue
      </button>

      {loading ? (
        <p className="text-[#6B7488] text-[14px]">Loading proposal…</p>
      ) : !detail ? (
        <p className="text-[#6B7488] text-[14px]">Proposal not found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <AdminPanel>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[#6B7488] text-[13px]">{governanceOperationLabel(detail.operationType)}</p>
                  <h2 className="text-[#0B1220] text-[20px] font-bold mt-1">{detail.summary}</h2>
                  <p className="text-[#6B7488] text-[13px] mt-2 font-mono">{detail.id}</p>
                </div>
                <AdminStatusPill variant={governanceStatusPillVariant(detail.status)}>
                  {proposalStatusLabel(detail.status)}
                </AdminStatusPill>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px]">
                <div>
                  <p className="text-[#6B7488] text-[12px]">Signatures</p>
                  <p className="text-[#0B1220] font-semibold mt-1">
                    {detail.validSignatureCount} / {detail.threshold}
                  </p>
                  <div className="mt-2 h-2 w-full max-w-[200px] rounded-full bg-[#E6E8EC] overflow-hidden">
                    <div
                      className="h-full bg-[#195EBC] transition-all duration-300"
                      style={{ width: `${signatureProgress}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[#6B7488] text-[12px]">Related</p>
                  <p className="text-[#0B1220] font-mono text-[13px] mt-1 break-all">
                    {detail.relatedType ?? '—'} · {detail.relatedId ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B7488] text-[12px]">Created</p>
                  <p className="text-[#0B1220] mt-1">
                    {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              {detail.simulationError ? (
                <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[#B91C1C] text-[14px]">
                  Simulation error: {detail.simulationError}
                </div>
              ) : null}

              {detail.preconditions.some((p) => !p.ok) ? (
                <div className="rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                  <p className="text-[#92400E] text-[14px] font-semibold">Failed preconditions</p>
                  <ul className="mt-2 space-y-1 text-[#78350F] text-[13px]">
                    {detail.preconditions
                      .filter((p) => !p.ok)
                      .map((p, i) => (
                        <li key={i}>
                          {p.label ?? 'Check'}: {p.error ?? 'Failed'}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              {detail.signatures.length > 0 ? (
                <div>
                  <p className="text-[#6B7488] text-[13px] font-medium">Signed</p>
                  <ul className="mt-2 space-y-1 font-mono text-[13px] text-[#16A34A]">
                    {detail.signatures.map((s) => (
                      <li key={s.signerAddress}>✓ {s.signerAddress}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {detail.missingSigners.length > 0 ? (
                <div>
                  <p className="text-[#6B7488] text-[13px] font-medium">Missing signers</p>
                  <ul className="mt-2 space-y-1 font-mono text-[13px] text-[#0B1220]">
                    {detail.missingSigners.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {txUrl ? (
                <p className="text-[14px]">
                  Execution tx:{' '}
                  <a href={txUrl} target="_blank" rel="noopener noreferrer" className="text-[#195EBC] hover:underline">
                    {detail.executionTxHash}
                  </a>
                </p>
              ) : null}

              {detail.status === 'failed' ? (
                <p className="text-[#B91C1C] text-[14px]">
                  Execution failed. Contact ops — there is no automatic retry for this proposal.
                </p>
              ) : null}
            </div>
          </AdminPanel>

          {executeTxHash ? (
            <div className="rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4">
              <p className="text-[#166534] text-[14px] font-semibold">Execution submitted</p>
              <p className="text-[#15803D] text-[13px] mt-1">
                {lastExecuteOutcome?.kind === 'completed' ? lastExecuteOutcome.message : ''}
              </p>
              {executeTxUrl ? (
                <a
                  href={executeTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#195EBC] text-[13px] font-semibold hover:underline mt-2 inline-block"
                >
                  View transaction
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => dispatch(clearLastExecuteOutcome())}
                className="mt-2 block text-[#6B7488] text-[12px] hover:underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <AdminPanel>
            <div className="px-5 py-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canSign}
                onClick={() => void handleSign()}
                className="h-10 px-5 rounded-[4px] bg-[#195EBC] text-white text-[14px] font-semibold disabled:opacity-40"
              >
                {signPending || (actionStatus === 'loading' && actionKind === 'sign')
                  ? 'Signing…'
                  : 'Sign proposal'}
              </button>
              <button
                type="button"
                disabled={!canExecute}
                onClick={handleExecute}
                className="h-10 px-5 rounded-[4px] bg-[#16A34A] text-white text-[14px] font-semibold disabled:opacity-40"
              >
                {actionStatus === 'loading' && actionKind === 'execute' ? 'Executing…' : 'Execute'}
              </button>
              <button
                type="button"
                disabled={!canCancel}
                onClick={handleCancel}
                className="h-10 px-5 rounded-[4px] bg-[#DC2626] text-white text-[14px] font-semibold disabled:opacity-40"
              >
                {actionStatus === 'loading' && actionKind === 'cancel' ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
            {signingNote ? (
              <p className="px-5 pb-2 text-[#6B7488] text-[13px]">{signingNote}</p>
            ) : null}
            {!isConnected ? (
              <p className="px-5 pb-4 text-[#6B7488] text-[13px]">
                Connect your owner wallet in the top bar to sign this proposal.
              </p>
            ) : !isSigner ? (
              <p className="px-5 pb-4 text-[#6B7488] text-[13px]">
                Connected wallet is not a multisig signer for this deployment.
              </p>
            ) : alreadySigned ? (
              <p className="px-5 pb-4 text-[#16A34A] text-[13px]">You have already signed this proposal.</p>
            ) : null}
          </AdminPanel>

          {detail.calls.length > 0 ? (
            <AdminPanel>
              <div className="px-5 py-5">
                <h3 className="text-[#0B1220] font-semibold text-[16px]">On-chain calls</h3>
                <div className="mt-4 space-y-4">
                  {detail.calls.map((call, i) => {
                    const decoded = formatDecodedArgs(call.decodedArgs)
                    return (
                      <div key={i} className="rounded-[8px] border border-[#E6E8EC] p-4 text-[13px]">
                        {call.contract || call.function ? (
                          <p className="text-[#0B1220] font-medium">
                            {call.contract ?? 'Contract'}.{call.function ?? 'call'}
                          </p>
                        ) : null}
                        <p className="font-mono text-[#0B1220] break-all mt-1">Target: {call.target}</p>
                        {decoded ? (
                          <pre className="mt-2 text-[#6B7488] text-[12px] whitespace-pre-wrap">{decoded}</pre>
                        ) : (
                          <p className="font-mono text-[#6B7488] break-all mt-2">Calldata: {call.calldata}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </AdminPanel>
          ) : null}
        </div>
      )}
    </AdminPageFrame>
  )
}

export default AdminGovernanceProposalDetailPage
