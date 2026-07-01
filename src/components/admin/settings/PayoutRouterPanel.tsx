import { useCallback, useEffect, useRef, useState } from 'react'

import {
  PrivilegedActionFeedbackLayer,
  submitAdminAction,
  type PrivilegedActionPhase,
  type ResolvedGovernanceOutcome,
} from '@/admin/governance'
import {
  addressesEqual,
  assertValidEthAddress,
  fetchProtocolSettingsState,
  postMultisigCreatePayoutRouterAcceptedTokenProposal,
  postMultisigCreatePayoutRouterAllocatorProposal,
  postMultisigCreatePayoutRouterFundingPoolProposal,
} from '@/api/adminProtocolSettings'
import {
  DEFAULT_PAYOUT_ROUTER,
  type PayoutRouterSettingsState,
} from '@/components/admin/settings/protocolSettingsDefaults'
import {
  SettingsField,
  SettingsPanel,
  SettingsSectionActions,
  shortAddress,
} from '@/components/admin/settings/SettingsPanel'
import { isAbortError } from '@/utils/abortError'
import { useAppSelector } from '@/store/hooks'

function toPayoutRouterDraft(
  api: Awaited<ReturnType<typeof fetchProtocolSettingsState>>,
): PayoutRouterSettingsState {
  return {
    fundingPool: api.payoutRouter.fundingPool || DEFAULT_PAYOUT_ROUTER.fundingPool,
    allocator: api.payoutRouter.allocator || DEFAULT_PAYOUT_ROUTER.allocator,
    acceptedToken: api.payoutRouter.acceptedToken || DEFAULT_PAYOUT_ROUTER.acceptedToken,
    minRepayment: DEFAULT_PAYOUT_ROUTER.minRepayment,
  }
}

const PayoutRouterPanel = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [draft, setDraft] = useState<PayoutRouterSettingsState>(() => ({ ...DEFAULT_PAYOUT_ROUTER }))
  const baselineRef = useRef<PayoutRouterSettingsState>(DEFAULT_PAYOUT_ROUTER)
  const submitAbortRef = useRef<AbortController | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [submitPhase, setSubmitPhase] = useState<PrivilegedActionPhase>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<ResolvedGovernanceOutcome | null>(null)

  const syncDraftToChain = useCallback((next: PayoutRouterSettingsState) => {
    setDraft(next)
    baselineRef.current = next
  }, [])

  const refreshChainState = useCallback(async () => {
    if (!accessToken?.trim()) return
    const state = await fetchProtocolSettingsState(accessToken)
    syncDraftToChain(toPayoutRouterDraft(state))
    setLoadError(null)
  }, [accessToken, syncDraftToChain])

  useEffect(() => {
    if (!accessToken?.trim()) return
    let cancelled = false
    void (async () => {
      try {
        const state = await fetchProtocolSettingsState(accessToken)
        if (cancelled) return
        syncDraftToChain(toPayoutRouterDraft(state))
        setLoadError(null)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load payout router settings.')
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
      setSaveNotice('Sign in to submit payout router changes.')
      return
    }

    const baseline = baselineRef.current
    const fundingPoolChanged = !addressesEqual(draft.fundingPool, baseline.fundingPool)
    const allocatorChanged = !addressesEqual(draft.allocator, baseline.allocator)
    const acceptedTokenChanged = !addressesEqual(draft.acceptedToken, baseline.acceptedToken)

    if (!fundingPoolChanged && !allocatorChanged && !acceptedTokenChanged) {
      setSaveNotice('No payout router changes to submit.')
      return
    }

    try {
      if (fundingPoolChanged) {
        assertValidEthAddress(draft.fundingPool, 'Funding pool address')
      }
      if (allocatorChanged) {
        assertValidEthAddress(draft.allocator, 'Allocator address')
      }
      if (acceptedTokenChanged) {
        assertValidEthAddress(draft.acceptedToken, 'Accepted token address')
      }
    } catch (e) {
      setSaveNotice(e instanceof Error ? e.message : 'Invalid payout router values.')
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
          | 'payout_router_funding_pool'
          | 'payout_router_allocator'
          | 'payout_router_accepted_token'
        run: () => Promise<ResolvedGovernanceOutcome>
      }[] = []

      if (fundingPoolChanged) {
        tasks.push({
          operationType: 'payout_router_funding_pool',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreatePayoutRouterFundingPoolProposal(accessToken, draft.fundingPool.trim(), {
                  signal: controller.signal,
                }),
              { operationType: 'payout_router_funding_pool' },
            ),
        })
      }
      if (allocatorChanged) {
        tasks.push({
          operationType: 'payout_router_allocator',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreatePayoutRouterAllocatorProposal(accessToken, draft.allocator.trim(), {
                  signal: controller.signal,
                }),
              { operationType: 'payout_router_allocator' },
            ),
        })
      }
      if (acceptedTokenChanged) {
        tasks.push({
          operationType: 'payout_router_accepted_token',
          run: () =>
            submitAdminAction(
              () =>
                postMultisigCreatePayoutRouterAcceptedTokenProposal(
                  accessToken,
                  draft.acceptedToken.trim(),
                  { signal: controller.signal },
                ),
              { operationType: 'payout_router_accepted_token' },
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
              ? 'Payout router change proposal created.'
              : `Created ${createdProposalIds.length} governance proposals. Review the first proposal; others are in the governance queue.`,
          operationType: tasks[0]?.operationType ?? 'payout_router_funding_pool',
        })
        setSubmitPhase('succeeded')
      } else {
        setSubmitPhase('idle')
      }
    } catch (e) {
      if (isAbortError(e) || controller.signal.aborted) {
        setSubmitPhase('idle')
        return
      }
      setSubmitError(e instanceof Error ? e.message : 'Could not submit payout router changes.')
      setSubmitPhase('failed')
    } finally {
      if (submitAbortRef.current === controller) {
        submitAbortRef.current = null
      }
    }
  }, [accessToken, draft])

  const handleDismissSubmitFeedback = useCallback(() => {
    submitAbortRef.current?.abort()
    submitAbortRef.current = null
    setSubmitPhase('idle')
    setSubmitError(null)
    setOutcome(null)
    if (!accessToken?.trim()) return
    void refreshChainState().catch(() => {
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

  const setField = <K extends keyof PayoutRouterSettingsState>(
    key: K,
    value: PayoutRouterSettingsState[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setSaveNotice(null)
  }

  return (
    <>
      <PrivilegedActionFeedbackLayer
        phase={submitPhase}
        resolvedOutcome={outcome}
        loadingTitle="Submitting payout router changes"
        loadingDescription="Creating multisig governance proposals for PayoutRouter configuration."
        errorTitle="Could not submit payout router changes"
        errorDescription={submitError ?? undefined}
        directSuccessTitle="Payout router updated"
        onDismiss={handleDismissSubmitFeedback}
        onRetry={() => void handleSave()}
        onCancelLoading={handleCancelSubmitLoading}
      />

      <SettingsPanel
        title="Payout Router Wiring"
        description="Cross-contract addresses for disbursements. Apply creates multisig proposals; on-chain state updates after execute."
        actions={
          <SettingsSectionActions
            onCancel={handleCancelDraft}
            onSave={() => void handleSave()}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SettingsField
            id="fundingPool"
            label="Funding pool"
            value={draft.fundingPool}
            mono
            hint={`setFundingPool · ${shortAddress(draft.fundingPool)}`}
            onChange={(v) => setField('fundingPool', v)}
          />
          <SettingsField
            id="allocator"
            label="Allocator"
            value={draft.allocator}
            mono
            hint={`setAllocator · ${shortAddress(draft.allocator)}`}
            onChange={(v) => setField('allocator', v)}
          />
          <SettingsField
            id="acceptedToken"
            label="Accepted token"
            value={draft.acceptedToken}
            mono
            hint="Must match pool accepted token."
            onChange={(v) => setField('acceptedToken', v)}
          />
          <SettingsField
            id="minRepayment"
            label="Min repayment"
            value={draft.minRepayment}
            readOnly
            hint="Declared in contract but unused — no setter."
          />
        </div>
      </SettingsPanel>
    </>
  )
}

export default PayoutRouterPanel
