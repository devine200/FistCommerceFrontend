import { useCallback, useEffect, useRef, useState } from 'react'

import {
  AdminGovernanceStatusBadge,
  PrivilegedActionFeedbackLayer,
  submitAdminAction,
  type PrivilegedActionPhase,
  type ResolvedGovernanceOutcome,
} from '@/admin/governance'
import {
  fetchProtocolSafetyState,
  postMultisigCreateProtocolPauseProposal,
  type ProtocolSafetyState as ProtocolSafetyApiState,
} from '@/api/protocolSafety'
import { AdminStatusPill } from '@/components/admin/primitives'
import {
  DEFAULT_PROTOCOL_SAFETY,
  type ProtocolSafetyState,
} from '@/components/admin/settings/protocolSettingsDefaults'
import {
  SettingsPanel,
  SettingsSectionActions,
} from '@/components/admin/settings/SettingsPanel'
import { isAbortError } from '@/utils/abortError'
import { useAppSelector } from '@/store/hooks'

function toDraftState(api: ProtocolSafetyApiState): ProtocolSafetyState {
  return { paused: api.paused }
}

const GRANULAR_FLAG_LABELS: { key: keyof ProtocolSafetyApiState; label: string }[] = [
  { key: 'depositsPaused', label: 'Deposits paused' },
  { key: 'withdrawalsPaused', label: 'Withdrawals paused' },
  { key: 'fundingPaused', label: 'Funding paused' },
  { key: 'repaymentsPaused', label: 'Repayments paused' },
]

const ProtocolSafetyPanel = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [draft, setDraft] = useState<ProtocolSafetyState>(() => ({ ...DEFAULT_PROTOCOL_SAFETY }))
  const [onChain, setOnChain] = useState<ProtocolSafetyApiState | null>(null)
  const baselineRef = useRef<boolean>(DEFAULT_PROTOCOL_SAFETY.paused)
  const submitAbortRef = useRef<AbortController | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false)
  const [unpauseConfirmOpen, setUnpauseConfirmOpen] = useState(false)
  const [submitPhase, setSubmitPhase] = useState<PrivilegedActionPhase>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<ResolvedGovernanceOutcome | null>(null)
  const [pendingProposalId, setPendingProposalId] = useState<string | null>(null)

  const syncDraftToChain = useCallback((api: ProtocolSafetyApiState) => {
    const next = toDraftState(api)
    setOnChain(api)
    setDraft(next)
    baselineRef.current = next.paused
  }, [])

  const refreshChainState = useCallback(async () => {
    if (!accessToken?.trim()) return
    const state = await fetchProtocolSafetyState(accessToken)
    syncDraftToChain(state)
    setLoadError(null)
  }, [accessToken, syncDraftToChain])

  useEffect(() => {
    if (!accessToken?.trim()) return
    let cancelled = false
    void (async () => {
      try {
        const state = await fetchProtocolSafetyState(accessToken)
        if (cancelled) return
        syncDraftToChain(state)
        setLoadError(null)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load protocol pause state.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken, syncDraftToChain])

  const handleSave = useCallback(async () => {
    setSaveNotice(null)
    if (!accessToken?.trim()) {
      setSaveNotice('Sign in to change protocol pause.')
      return
    }
    if (draft.paused === baselineRef.current) {
      setSaveNotice('No pause change to submit.')
      return
    }

    setSubmitPhase('loading')
    setSubmitError(null)
    setOutcome(null)
    submitAbortRef.current?.abort()
    const controller = new AbortController()
    submitAbortRef.current = controller

    const targetPaused = draft.paused

    try {
      const resolved = await submitAdminAction(
        () =>
          postMultisigCreateProtocolPauseProposal(accessToken, targetPaused, {
            signal: controller.signal,
          }),
        { operationType: 'protocol_pause' },
      )
      if (controller.signal.aborted) return

      setOutcome(resolved)
      setSubmitPhase('succeeded')

      if (resolved.kind === 'direct_complete') {
        baselineRef.current = targetPaused
        setOnChain((prev) =>
          prev
            ? { ...prev, paused: targetPaused }
            : {
                paused: targetPaused,
                depositsPaused: false,
                withdrawalsPaused: false,
                fundingPaused: false,
                repaymentsPaused: false,
              },
        )
        setDraft({ paused: targetPaused })
        setPendingProposalId(null)
      } else if (resolved.kind === 'proposal_queued') {
        setPendingProposalId(resolved.proposalId)
      }
    } catch (e) {
      if (isAbortError(e) || controller.signal.aborted) {
        setSubmitPhase('idle')
        return
      }
      setSubmitError(e instanceof Error ? e.message : 'Could not submit protocol pause change.')
      setSubmitPhase('failed')
    } finally {
      if (submitAbortRef.current === controller) {
        submitAbortRef.current = null
      }
    }
  }, [accessToken, draft.paused])

  const handleSaveClick = () => {
    if (draft.paused && !baselineRef.current) {
      setPauseConfirmOpen(true)
      return
    }
    if (!draft.paused && baselineRef.current) {
      setUnpauseConfirmOpen(true)
      return
    }
    void handleSave()
  }

  const handleDismissSubmitFeedback = useCallback(() => {
    submitAbortRef.current?.abort()
    submitAbortRef.current = null
    setSubmitPhase('idle')
    setSubmitError(null)
    setOutcome(null)
    if (!accessToken?.trim()) return
    void refreshChainState()
      .then(() => setPendingProposalId(null))
      .catch(() => {
        // Keep pending badge if refetch fails; draft still reverts to last known baseline.
        setDraft({ paused: baselineRef.current })
      })
  }, [accessToken, refreshChainState])

  const handleCancelSubmitLoading = useCallback(() => {
    submitAbortRef.current?.abort()
    submitAbortRef.current = null
    setSubmitPhase('idle')
    setSubmitError(null)
    setOutcome(null)
  }, [])

  const handleCancelDraft = useCallback(() => {
    setDraft({ paused: baselineRef.current })
    setSaveNotice(null)
  }, [])

  const togglePaused = () => {
    setDraft((prev) => ({ ...prev, paused: !prev.paused }))
    setSaveNotice(null)
  }

  const onChainPaused = onChain?.paused ?? baselineRef.current
  const draftDiffersFromChain = draft.paused !== onChainPaused

  return (
    <>
      {pauseConfirmOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5">
          <div
            role="dialog"
            aria-labelledby="pause-protocol-title"
            className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl"
          >
            <h3 id="pause-protocol-title" className="text-[#0B1220] text-[18px] font-bold">
              Pause protocol?
            </h3>
            <p className="mt-2 text-[#6B7488] text-[14px]">
              This creates a multisig governance proposal for{' '}
              <span className="font-mono text-[13px]">ProtocolController.setPaused(true)</span>. Owners
              must sign and the proposal must be executed before the protocol halts on-chain.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPauseConfirmOpen(false)}
                className="h-11 rounded-[8px] bg-[#E8EFFB] text-[#195EBC] text-[14px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPauseConfirmOpen(false)
                  void handleSave()
                }}
                className="h-11 rounded-[8px] bg-[#DC2626] text-white text-[14px] font-semibold"
              >
                Create pause proposal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {unpauseConfirmOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5">
          <div
            role="dialog"
            aria-labelledby="unpause-protocol-title"
            className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl"
          >
            <h3 id="unpause-protocol-title" className="text-[#0B1220] text-[18px] font-bold">
              Unpause protocol?
            </h3>
            <p className="mt-2 text-[#6B7488] text-[14px]">
              This creates a governance proposal for{' '}
              <span className="font-mono text-[13px]">ProtocolController.setPaused(false)</span>. The
              protocol stays paused on-chain until the proposal is signed and executed.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUnpauseConfirmOpen(false)}
                className="h-11 rounded-[8px] bg-[#E8EFFB] text-[#195EBC] text-[14px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnpauseConfirmOpen(false)
                  void handleSave()
                }}
                className="h-11 rounded-[8px] bg-[#195EBC] text-white text-[14px] font-semibold"
              >
                Create unpause proposal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PrivilegedActionFeedbackLayer
        phase={submitPhase}
        resolvedOutcome={outcome}
        loadingTitle="Submitting protocol pause change"
        loadingDescription="Creating a multisig governance proposal for ProtocolController.setPaused."
        errorTitle="Could not submit protocol pause"
        errorDescription={submitError ?? undefined}
        directSuccessTitle="Protocol pause updated"
        directSuccessDescription="The on-chain pause flag was updated directly (local bypass)."
        onDismiss={handleDismissSubmitFeedback}
        onRetry={() => void handleSave()}
        onCancelLoading={handleCancelSubmitLoading}
      />

      <SettingsPanel
        title="Protocol Safety"
        description="Global kill switch via ProtocolController.setPaused. Apply creates a multisig proposal; on-chain state updates only after execute (or immediately in local bypass)."
        badge={
          onChainPaused
            ? { label: 'Paused on-chain', variant: 'rejected' }
            : { label: 'Running on-chain', variant: 'approved' }
        }
        actions={
          <SettingsSectionActions
            onCancel={handleCancelDraft}
            onSave={handleSaveClick}
            saving={submitPhase === 'loading'}
            saveLabel="Apply"
          />
        }
      >
        {loadError ? (
          <p className="text-[#B91C1C] text-[14px] rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
            {loadError}
          </p>
        ) : null}
        {saveNotice ? <p className="text-[#6B7488] text-[14px]">{saveNotice}</p> : null}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <AdminGovernanceStatusBadge
            proposalId={pendingProposalId}
            governanceStatus={pendingProposalId ? 'pending_signatures' : 'none'}
          />
          {draftDiffersFromChain ? (
            <span className="text-[#6B7488] text-[13px]">
              Draft change not yet on-chain — apply to create a governance proposal.
            </span>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#E6E8EC] bg-[#FAFBFC] px-4 py-4">
          <div>
            <p className="text-[#0B1220] text-[15px] font-semibold">Global pause</p>
            <p className="mt-1 text-[#6B7488] text-[13px]">
              Target state for the next governance proposal. On-chain value updates after execute.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.paused}
            onClick={togglePaused}
            className={[
              'relative h-8 w-14 shrink-0 rounded-full transition-colors',
              draft.paused ? 'bg-[#DC2626]' : 'bg-[#195EBC]',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
                draft.paused ? 'left-7' : 'left-1',
              ].join(' ')}
            />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-[#6B7488]">
          <div className="flex items-center gap-2">
            <span>On-chain global pause:</span>
            <AdminStatusPill variant={onChainPaused ? 'rejected' : 'approved'}>
              {onChainPaused ? 'Paused' : 'Running'}
            </AdminStatusPill>
          </div>
          {draftDiffersFromChain ? (
            <div className="flex items-center gap-2">
              <span>After proposal executes:</span>
              <AdminStatusPill variant={draft.paused ? 'rejected' : 'approved'}>
                {draft.paused ? 'Paused' : 'Running'}
              </AdminStatusPill>
            </div>
          ) : null}
        </div>

        {onChain ? (
          <div className="mt-5 rounded-[8px] border border-[#E6E8EC] bg-[#FAFBFC] px-4 py-3">
            <p className="text-[#0B1220] text-[13px] font-semibold mb-2">Granular pause flags (read-only)</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#6B7488]">
              {GRANULAR_FLAG_LABELS.map(({ key, label }) => (
                <li key={key} className="flex items-center justify-between gap-2">
                  <span>{label}</span>
                  <AdminStatusPill variant={onChain[key] ? 'rejected' : 'approved'}>
                    {onChain[key] ? 'Yes' : 'No'}
                  </AdminStatusPill>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </SettingsPanel>
    </>
  )
}

export default ProtocolSafetyPanel
