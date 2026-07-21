import { useCallback, useEffect, useRef, useState } from 'react'

import { toUserFacingError } from '@/api/client'
import {
  AdminGovernanceStatusBadge,
  PrivilegedActionFeedbackLayer,
  submitAdminAction,
  type PrivilegedActionPhase,
  type ResolvedGovernanceOutcome,
} from '@/admin/governance'
import {
  fetchProtocolSafetyState,
  postMultisigCreateProtocolDepositsPauseProposal,
  postMultisigCreateProtocolFundingPauseProposal,
  postMultisigCreateProtocolPauseProposal,
  postMultisigCreateProtocolRepaymentsPauseProposal,
  postMultisigCreateProtocolWithdrawalsPauseProposal,
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
  return {
    paused: api.paused,
    depositsPaused: api.depositsPaused,
    withdrawalsPaused: api.withdrawalsPaused,
    fundingPaused: api.fundingPaused,
    repaymentsPaused: api.repaymentsPaused,
  }
}

type PauseFlagKey = keyof Omit<ProtocolSafetyState, never>

const GLOBAL_PAUSE_KEY: PauseFlagKey = 'paused'

const GRANULAR_FLAG_CONFIG: { key: PauseFlagKey; label: string; description: string }[] = [
  {
    key: 'depositsPaused',
    label: 'Deposits paused',
    description: 'Blocks new investor deposits into the funding pool.',
  },
  {
    key: 'withdrawalsPaused',
    label: 'Withdrawals paused',
    description: 'Blocks investor withdrawal requests and processing.',
  },
  {
    key: 'fundingPaused',
    label: 'Funding paused',
    description: 'Blocks new loan funding allocations.',
  },
  {
    key: 'repaymentsPaused',
    label: 'Repayments paused',
    description: 'Blocks merchant repayment processing.',
  },
]

function draftDiffersFromBaseline(draft: ProtocolSafetyState, baseline: ProtocolSafetyState): boolean {
  return (
    draft.paused !== baseline.paused ||
    draft.depositsPaused !== baseline.depositsPaused ||
    draft.withdrawalsPaused !== baseline.withdrawalsPaused ||
    draft.fundingPaused !== baseline.fundingPaused ||
    draft.repaymentsPaused !== baseline.repaymentsPaused
  )
}

const ProtocolSafetyPanel = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [draft, setDraft] = useState<ProtocolSafetyState>(() => ({ ...DEFAULT_PROTOCOL_SAFETY }))
  const [onChain, setOnChain] = useState<ProtocolSafetyApiState | null>(null)
  const baselineRef = useRef<ProtocolSafetyState>(DEFAULT_PROTOCOL_SAFETY)
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
    baselineRef.current = next
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
          setLoadError(toUserFacingError(e, 'Could not load protocol pause state.'))
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

    const baseline = baselineRef.current
    const globalChanged = draft.paused !== baseline.paused
    const depositsChanged = draft.depositsPaused !== baseline.depositsPaused
    const withdrawalsChanged = draft.withdrawalsPaused !== baseline.withdrawalsPaused
    const fundingChanged = draft.fundingPaused !== baseline.fundingPaused
    const repaymentsChanged = draft.repaymentsPaused !== baseline.repaymentsPaused

    if (!globalChanged && !depositsChanged && !withdrawalsChanged && !fundingChanged && !repaymentsChanged) {
      setSaveNotice('No pause change to submit.')
      return
    }

    setSubmitPhase('loading')
    setSubmitError(null)
    setOutcome(null)
    submitAbortRef.current?.abort()
    const controller = new AbortController()
    submitAbortRef.current = controller

    try {
      const createdProposalIds: string[] = []
      const tasks: {
        operationType:
          | 'protocol_pause'
          | 'protocol_deposits_pause'
          | 'protocol_withdrawals_pause'
          | 'protocol_funding_pause'
          | 'protocol_repayments_pause'
        run: () => Promise<ResolvedGovernanceOutcome>
      }[] = []

      if (globalChanged) {
        tasks.push({
          operationType: 'protocol_pause',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreateProtocolPauseProposal(accessToken, draft.paused, {
                  signal: controller.signal,
                }),
              { operationType: 'protocol_pause' },
            ),
        })
      }
      if (depositsChanged) {
        tasks.push({
          operationType: 'protocol_deposits_pause',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreateProtocolDepositsPauseProposal(accessToken, draft.depositsPaused, {
                  signal: controller.signal,
                }),
              { operationType: 'protocol_deposits_pause' },
            ),
        })
      }
      if (withdrawalsChanged) {
        tasks.push({
          operationType: 'protocol_withdrawals_pause',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreateProtocolWithdrawalsPauseProposal(
                  accessToken,
                  draft.withdrawalsPaused,
                  { signal: controller.signal },
                ),
              { operationType: 'protocol_withdrawals_pause' },
            ),
        })
      }
      if (fundingChanged) {
        tasks.push({
          operationType: 'protocol_funding_pause',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreateProtocolFundingPauseProposal(accessToken, draft.fundingPaused, {
                  signal: controller.signal,
                }),
              { operationType: 'protocol_funding_pause' },
            ),
        })
      }
      if (repaymentsChanged) {
        tasks.push({
          operationType: 'protocol_repayments_pause',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreateProtocolRepaymentsPauseProposal(
                  accessToken,
                  draft.repaymentsPaused,
                  { signal: controller.signal },
                ),
              { operationType: 'protocol_repayments_pause' },
            ),
        })
      }

      for (const task of tasks) {
        if (controller.signal.aborted) return
        const resolved = await task.run()
        if (controller.signal.aborted) return
        if (resolved.kind === 'direct_complete') {
          setOutcome(resolved)
          setSubmitPhase('succeeded')
          baselineRef.current = structuredClone(draft)
          setOnChain((prev) => (prev ? { ...prev, ...draft } : { ...draft }))
          setPendingProposalId(null)
          return
        }
        if (resolved.kind === 'proposal_queued') {
          createdProposalIds.push(resolved.proposalId)
        }
      }

      if (controller.signal.aborted) return

      if (createdProposalIds.length > 0) {
        setOutcome({
          kind: 'proposal_queued',
          proposalId: createdProposalIds[0],
          message:
            createdProposalIds.length === 1
              ? 'Protocol pause change proposal created.'
              : `Created ${createdProposalIds.length} governance proposals. Review the first proposal; others are in the governance queue.`,
          operationType: tasks[0]?.operationType ?? 'protocol_pause',
        })
        setSubmitPhase('succeeded')
        setPendingProposalId(createdProposalIds[0])
      } else {
        setSubmitPhase('idle')
      }
    } catch (e) {
      if (isAbortError(e) || controller.signal.aborted) {
        setSubmitPhase('idle')
        return
      }
      setSubmitError(toUserFacingError(e, 'Could not submit protocol pause change.'))
      setSubmitPhase('failed')
    } finally {
      if (submitAbortRef.current === controller) {
        submitAbortRef.current = null
      }
    }
  }, [accessToken, draft])

  const handleSaveClick = () => {
    const baseline = baselineRef.current
    const enablingGlobalPause = draft.paused && !baseline.paused
    const disablingGlobalPause = !draft.paused && baseline.paused
    const enablingSensitiveGranularPause =
      (draft.depositsPaused && !baseline.depositsPaused) ||
      (draft.fundingPaused && !baseline.fundingPaused)

    if (enablingGlobalPause) {
      setPauseConfirmOpen(true)
      return
    }
    if (disablingGlobalPause) {
      setUnpauseConfirmOpen(true)
      return
    }
    if (enablingSensitiveGranularPause) {
      if (
        !window.confirm(
          'Enable granular pause flags? This creates governance proposals. Deposits and funding pauses affect live protocol activity.',
        )
      ) {
        return
      }
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
        setDraft(structuredClone(baselineRef.current))
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
    setDraft(structuredClone(baselineRef.current))
    setSaveNotice(null)
  }, [])

  const toggleFlag = (key: PauseFlagKey) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaveNotice(null)
  }

  const onChainState = onChain ? toDraftState(onChain) : baselineRef.current
  const hasDraftChainDiff = draftDiffersFromBaseline(draft, onChainState)
  const hasUnsavedDraftChanges = draftDiffersFromBaseline(draft, baselineRef.current)

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
        loadingTitle="Submitting protocol pause changes"
        loadingDescription="Creating multisig governance proposals for ProtocolController pause flags."
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
        description="Global and granular pause controls via ProtocolController. Apply creates multisig proposals; on-chain state updates only after execute (or immediately in local bypass for global pause)."
        badge={
          onChainState.paused
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
          {hasDraftChainDiff ? (
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
            onClick={() => toggleFlag(GLOBAL_PAUSE_KEY)}
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
            <AdminStatusPill variant={onChainState.paused ? 'rejected' : 'approved'}>
              {onChainState.paused ? 'Paused' : 'Running'}
            </AdminStatusPill>
          </div>
          {draft.paused !== onChainState.paused ? (
            <div className="flex items-center gap-2">
              <span>After proposal executes:</span>
              <AdminStatusPill variant={draft.paused ? 'rejected' : 'approved'}>
                {draft.paused ? 'Paused' : 'Running'}
              </AdminStatusPill>
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-[8px] border border-[#E6E8EC] bg-[#FAFBFC] px-4 py-3">
          <p className="text-[#0B1220] text-[13px] font-semibold mb-3">Granular pause flags</p>
          <ul className="flex flex-col gap-3">
            {GRANULAR_FLAG_CONFIG.map(({ key, label, description }) => {
              const onChainValue = onChainState[key]
              const draftValue = draft[key]
              const changed = draftValue !== onChainState[key]
              return (
                <li
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[8px] border border-[#EEF0F4] bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-[#0B1220] text-[14px] font-medium">{label}</p>
                    <p className="mt-0.5 text-[#6B7488] text-[12px]">{description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7488]">
                      <span className="inline-flex items-center gap-1.5">
                        On-chain:
                        <AdminStatusPill variant={onChainValue ? 'rejected' : 'approved'}>
                          {onChainValue ? 'Paused' : 'Running'}
                        </AdminStatusPill>
                      </span>
                      {changed ? (
                        <span className="inline-flex items-center gap-1.5">
                          Draft:
                          <AdminStatusPill variant={draftValue ? 'rejected' : 'approved'}>
                            {draftValue ? 'Paused' : 'Running'}
                          </AdminStatusPill>
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draftValue}
                    aria-label={label}
                    onClick={() => toggleFlag(key)}
                    className={[
                      'relative h-8 w-14 shrink-0 rounded-full transition-colors',
                      draftValue ? 'bg-[#DC2626]' : 'bg-[#195EBC]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
                        draftValue ? 'left-7' : 'left-1',
                      ].join(' ')}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
          {hasUnsavedDraftChanges ? (
            <p className="mt-3 text-[12px] text-[#9CA3AF]">
              Only changed flags create governance proposals on Apply.
            </p>
          ) : null}
        </div>
      </SettingsPanel>
    </>
  )
}

export default ProtocolSafetyPanel
