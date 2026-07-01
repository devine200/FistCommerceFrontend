import { useCallback, useEffect, useRef, useState } from 'react'

import { postMultisigCreateRiskTierProposal } from '@/api/multisig/proposals'
import {
  bpsToPercent,
  fetchProtocolSettingsState,
  percentToBps,
  postMultisigCreateMaxMerchantBpsProposal,
} from '@/api/adminProtocolSettings'
import { fetchRiskTiers } from '@/api/riskTiers'
import {
  PrivilegedActionFeedbackLayer,
  buildRiskTierProposalBody,
  submitAdminAction,
  type PrivilegedActionPhase,
  type ResolvedGovernanceOutcome,
} from '@/admin/governance'
import { isAbortError } from '@/utils/abortError'
import type { ProtocolRiskTier, RiskAllocationState } from '@/components/admin/settings/protocolSettingsDefaults'
import { DEFAULT_RISK_ALLOCATION } from '@/components/admin/settings/protocolSettingsDefaults'
import {
  SettingsField,
  SettingsPanel,
  SettingsSectionActions,
} from '@/components/admin/settings/SettingsPanel'
import { AdminStatusPill } from '@/components/admin/primitives'
import { useAppSelector } from '@/store/hooks'

function nextTierId(tiers: ProtocolRiskTier[]): number {
  if (tiers.length === 0) return 1
  return Math.max(...tiers.map((t) => t.id)) + 1
}

function createDefaultTier(id: number): ProtocolRiskTier {
  return {
    id,
    interestPercent: '10',
    maxTenorDays: '90',
    active: true,
  }
}

function tierSnapshotKey(tier: ProtocolRiskTier): string {
  return `${tier.id}|${tier.interestPercent}|${tier.maxTenorDays}|${tier.active}`
}

function findChangedTiers(baseline: ProtocolRiskTier[], next: ProtocolRiskTier[]): ProtocolRiskTier[] {
  const baselineById = new Map(baseline.map((t) => [t.id, tierSnapshotKey(t)]))
  const changed: ProtocolRiskTier[] = []
  for (const tier of next) {
    const prev = baselineById.get(tier.id)
    if (!prev || prev !== tierSnapshotKey(tier)) {
      changed.push(tier)
    }
  }
  return changed
}

const RiskAllocationPanel = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [draft, setDraft] = useState<RiskAllocationState>(() => structuredClone(DEFAULT_RISK_ALLOCATION))
  const baselineTiersRef = useRef<ProtocolRiskTier[]>(DEFAULT_RISK_ALLOCATION.tiers)
  const baselineMaxMerchantRef = useRef<string>(DEFAULT_RISK_ALLOCATION.maxMerchantPercent)
  const submitAbortRef = useRef<AbortController | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [submitPhase, setSubmitPhase] = useState<PrivilegedActionPhase>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<ResolvedGovernanceOutcome | null>(null)

  const syncBaseline = useCallback((next: RiskAllocationState) => {
    setDraft(next)
    baselineTiersRef.current = structuredClone(next.tiers)
    baselineMaxMerchantRef.current = next.maxMerchantPercent
  }, [])

  const refreshChainState = useCallback(async () => {
    const [tiers, settings] = await Promise.all([
      fetchRiskTiers(),
      accessToken?.trim() ? fetchProtocolSettingsState(accessToken) : Promise.resolve(null),
    ])
    const mapped =
      tiers.length > 0
        ? tiers.map((t) => ({
            id: t.id,
            interestPercent: String(t.interest_percent),
            maxTenorDays: String(t.duration_days),
            active: t.active,
          }))
        : structuredClone(DEFAULT_RISK_ALLOCATION.tiers)
    const maxMerchantPercent = settings
      ? bpsToPercent(settings.riskAllocator.maxMerchantBps)
      : DEFAULT_RISK_ALLOCATION.maxMerchantPercent
    syncBaseline({ maxMerchantPercent, tiers: mapped })
    setLoadError(null)
  }, [accessToken, syncBaseline])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [tiers, settings] = await Promise.all([
          fetchRiskTiers(),
          accessToken?.trim() ? fetchProtocolSettingsState(accessToken) : Promise.resolve(null),
        ])
        if (cancelled) return
        const mapped =
          tiers.length > 0
            ? tiers.map((t) => ({
                id: t.id,
                interestPercent: String(t.interest_percent),
                maxTenorDays: String(t.duration_days),
                active: t.active,
              }))
            : structuredClone(DEFAULT_RISK_ALLOCATION.tiers)
        const maxMerchantPercent = settings
          ? bpsToPercent(settings.riskAllocator.maxMerchantBps)
          : DEFAULT_RISK_ALLOCATION.maxMerchantPercent
        syncBaseline({ maxMerchantPercent, tiers: mapped })
        setLoadError(null)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load on-chain risk settings.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken, syncBaseline])

  const handleSave = useCallback(async () => {
    setSaveNotice(null)
    if (!accessToken?.trim()) {
      setSaveNotice('Sign in to submit risk allocation changes.')
      return
    }

    const changedTiers = findChangedTiers(baselineTiersRef.current, draft.tiers)
    const maxMerchantChanged =
      draft.maxMerchantPercent.trim() !== baselineMaxMerchantRef.current.trim()

    if (changedTiers.length === 0 && !maxMerchantChanged) {
      setSaveNotice('No risk allocation changes to submit.')
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

      if (maxMerchantChanged) {
        if (controller.signal.aborted) return
        const resolved = await submitAdminAction(
          () =>
            postMultisigCreateMaxMerchantBpsProposal(
              accessToken,
              percentToBps(draft.maxMerchantPercent),
              { signal: controller.signal },
            ),
          { operationType: 'max_merchant_bps' },
        )
        if (controller.signal.aborted) return
        if (resolved.kind === 'direct_complete') {
          setOutcome(resolved)
          setSubmitPhase('succeeded')
          baselineMaxMerchantRef.current = draft.maxMerchantPercent.trim()
          baselineTiersRef.current = structuredClone(draft.tiers)
          return
        }
        if (resolved.kind === 'proposal_queued') {
          createdProposalIds.push(resolved.proposalId)
        }
      }

      for (const tier of changedTiers) {
        if (controller.signal.aborted) return
        const resolved = await submitAdminAction(
          () =>
            postMultisigCreateRiskTierProposal(
              accessToken,
              buildRiskTierProposalBody({
                tierId: tier.id,
                interestPercent: Number(tier.interestPercent),
                maxTenorDays: Number(tier.maxTenorDays),
                active: tier.active,
              }),
              { signal: controller.signal },
            ),
          { operationType: 'risk_tier' },
        )
        if (controller.signal.aborted) return
        if (resolved.kind === 'direct_complete') {
          setOutcome(resolved)
          setSubmitPhase('succeeded')
          baselineMaxMerchantRef.current = draft.maxMerchantPercent.trim()
          baselineTiersRef.current = structuredClone(draft.tiers)
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
              ? 'Risk allocation change proposal created.'
              : `Created ${createdProposalIds.length} governance proposals. Review the first proposal; others are in the governance queue.`,
          operationType: maxMerchantChanged ? 'max_merchant_bps' : 'risk_tier',
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
      setSubmitError(e instanceof Error ? e.message : 'Could not submit risk allocation changes.')
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
    void refreshChainState().catch(() => {
      setDraft({
        maxMerchantPercent: baselineMaxMerchantRef.current,
        tiers: structuredClone(baselineTiersRef.current),
      })
    })
  }, [refreshChainState])

  const handleCancelSubmitLoading = useCallback(() => {
    submitAbortRef.current?.abort()
    submitAbortRef.current = null
    setSubmitPhase('idle')
    setSubmitError(null)
    setOutcome(null)
  }, [])

  const handleCancelDraft = useCallback(() => {
    setDraft({
      maxMerchantPercent: baselineMaxMerchantRef.current,
      tiers: structuredClone(baselineTiersRef.current),
    })
    setSaveNotice(null)
  }, [])

  const updateTier = (id: number, patch: Partial<ProtocolRiskTier>) => {
    setDraft((prev) => ({
      ...prev,
      tiers: prev.tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)),
    }))
    setSaveNotice(null)
  }

  const toggleTierActive = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      tiers: prev.tiers.map((tier) =>
        tier.id === id ? { ...tier, active: !tier.active } : tier,
      ),
    }))
    setSaveNotice(null)
  }

  const addTier = useCallback(() => {
    setDraft((prev) => {
      const id = nextTierId(prev.tiers)
      return {
        ...prev,
        tiers: [...prev.tiers, createDefaultTier(id)],
      }
    })
    setSaveNotice(null)
  }, [])

  const removeTier = useCallback(
    (id: number) => {
      const tier = draft.tiers.find((t) => t.id === id)
      const label = tier ? `tier ${tier.id}` : 'this tier'
      if (!window.confirm(`Remove ${label} from the list? Apply to submit on-chain via setRiskTier.`)) {
        return
      }
      setDraft((prev) => ({
        ...prev,
        tiers: prev.tiers.filter((tier) => tier.id !== id),
      }))
      setSaveNotice(null)
    },
    [draft.tiers],
  )

  return (
    <>
      <SettingsPanel
        title="Risk & Allocation"
        description="Risk tiers and merchant concentration limits on AllocationController. Each changed field creates a multisig governance proposal."
        actions={
          <SettingsSectionActions
            onCancel={handleCancelDraft}
            onSave={() => void handleSave()}
            saving={submitPhase === 'loading'}
            saveLabel="Apply"
          />
        }
      >
        {loadError ? <p className="text-[#DC2626] text-[14px]">{loadError}</p> : null}
        {saveNotice ? <p className="text-[#6B7488] text-[14px]">{saveNotice}</p> : null}
        <SettingsField
          id="maxMerchantPercent"
          label="Max merchant concentration"
          value={draft.maxMerchantPercent}
          suffix="%"
          hint="Maps to setMaxMerchantBps (0–100%)."
          onChange={(v) => {
            setDraft((prev) => ({ ...prev, maxMerchantPercent: v }))
            setSaveNotice(null)
          }}
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-[#0B1220] text-[15px] font-semibold">Risk tiers</h3>
            <button
              type="button"
              onClick={addTier}
              className="h-9 px-4 rounded-[6px] border border-[#195EBC] text-[#195EBC] text-[13px] font-semibold hover:bg-[#E8EFFB] transition-colors"
            >
              Add risk tier
            </button>
          </div>

          {draft.tiers.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[#D1D5DB] bg-[#FAFBFC] px-5 py-10 text-center">
              <p className="text-[#6B7488] text-[14px]">No risk tiers configured.</p>
              <button
                type="button"
                onClick={addTier}
                className="mt-3 text-[#195EBC] text-[14px] font-semibold hover:underline"
              >
                Add your first tier
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[8px] border border-[#E6E8EC]">
              <table className="min-w-[720px] w-full text-left text-[14px]">
                <thead className="bg-[#F8F9FB] text-[#6B7488] text-[12px] font-semibold uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Tier ID</th>
                    <th className="px-4 py-3">APR (%)</th>
                    <th className="px-4 py-3">Max tenor (days)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.tiers.map((tier) => (
                    <tr key={tier.id} className="border-t border-[#EEF0F4]">
                      <td className="px-4 py-3 font-mono font-medium text-[#0B1220]">{tier.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tier.interestPercent}
                          onChange={(e) => updateTier(tier.id, { interestPercent: e.target.value })}
                          className="h-9 w-24 rounded-[6px] bg-[#F0F2F5] px-2 text-[14px] outline-none focus:ring-2 focus:ring-[#195EBC]/25"
                          aria-label={`Tier ${tier.id} APR`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.maxTenorDays}
                          onChange={(e) => updateTier(tier.id, { maxTenorDays: e.target.value })}
                          className="h-9 w-24 rounded-[6px] bg-[#F0F2F5] px-2 text-[14px] outline-none focus:ring-2 focus:ring-[#195EBC]/25"
                          aria-label={`Tier ${tier.id} max tenor days`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusPill variant={tier.active ? 'active' : 'neutral'}>
                          {tier.active ? 'Active' : 'Inactive'}
                        </AdminStatusPill>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleTierActive(tier.id)}
                          className="text-[#195EBC] text-[13px] font-semibold hover:underline"
                        >
                          {tier.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeTier(tier.id)}
                          className="text-[#DC2626] text-[13px] font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-2 text-[12px] text-[#9CA3AF]">
            Only changed fields are submitted. Each change creates a separate governance proposal for multisig
            signatures.
          </p>
        </div>
      </SettingsPanel>

      <PrivilegedActionFeedbackLayer
        phase={submitPhase}
        resolvedOutcome={outcome}
        loadingTitle="Submitting risk allocation changes"
        loadingDescription="Creating multisig governance proposals for AllocationController settings…"
        errorTitle="Unable to submit risk allocation changes"
        errorDescription={submitError ?? undefined}
        directSuccessTitle="Risk allocation changes submitted"
        onDismiss={handleDismissSubmitFeedback}
        onRetry={() => void handleSave()}
        onCancelLoading={handleCancelSubmitLoading}
      />
    </>
  )
}

export default RiskAllocationPanel
