import { Link } from 'react-router-dom'

import AdminConfirmModal from '@/components/admin/AdminConfirmModal'
import { adminGovernanceProposalPath } from '@/api/adminActionResponse'

import type { GovernanceNonceConfirmPayload, GovernanceNonceWarningMode } from './governanceNonceWarningTypes'

const MAX_VISIBLE_BLOCKING = 5

export type GovernanceNonceWarningModalProps = {
  open: boolean
  payload: GovernanceNonceConfirmPayload | null
  confirmLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function titleForMode(mode: GovernanceNonceWarningMode): string {
  if (mode === 'queue_jump_execute') return 'Skip queue and execute?'
  return 'Sign ahead of queue?'
}

function confirmLabelForMode(mode: GovernanceNonceWarningMode, requiresResign?: boolean): string {
  if (mode === 'queue_jump_execute') {
    return requiresResign ? 'Prepare and re-sign' : 'Continue execute'
  }
  return 'Sign anyway'
}

function BlockingProposalList({ ids }: { ids: string[] }) {
  if (!ids.length) {
    return (
      <p className="text-[13px] text-[#6B7280]">
        No other open proposals hold a lower reserved nonce (live nonce gap).
      </p>
    )
  }
  const visible = ids.slice(0, MAX_VISIBLE_BLOCKING)
  const remainder = ids.length - visible.length
  return (
    <ul className="mt-2 space-y-1.5">
      {visible.map((id) => (
        <li key={id}>
          <Link
            to={adminGovernanceProposalPath(id)}
            className="font-mono text-[13px] text-[#195EBC] underline underline-offset-2 break-all"
          >
            {id}
          </Link>
        </li>
      ))}
      {remainder > 0 ? (
        <li className="text-[13px] text-[#6B7280]">+ {remainder} more proposal{remainder === 1 ? '' : 's'}</li>
      ) : null}
    </ul>
  )
}

export default function GovernanceNonceWarningModal({
  open,
  payload,
  confirmLoading = false,
  onConfirm,
  onCancel,
}: GovernanceNonceWarningModalProps) {
  if (!payload) return null

  const nonceLine =
    payload.liveNonce != null && payload.reservedNonce != null
      ? `Live on-chain nonce: ${payload.liveNonce} · This proposal: ${payload.reservedNonce}`
      : null

  return (
    <AdminConfirmModal
      open={open}
      variant="warning"
      title={titleForMode(payload.mode)}
      description={payload.message}
      confirmLabel={confirmLabelForMode(payload.mode, payload.requiresResign)}
      cancelLabel="Go back"
      confirmLoading={confirmLoading}
      dismissible={!confirmLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {nonceLine ? <p className="text-[13px] text-[#374151]">{nonceLine}</p> : null}
      {payload.willInvalidateOthers ? (
        <p className="mt-3 text-[13px] font-medium text-[#92400E]">
          Earlier open proposals will become stale and need Restart signatures if you still want them
          on-chain.
        </p>
      ) : (
        <p className="mt-3 text-[13px] text-[#6B7280]">
          Signing ahead does not invalidate other proposals. Execution still waits until earlier
          nonces are used, unless you queue-jump execute.
        </p>
      )}
      {payload.requiresResign ? (
        <p className="mt-3 text-[13px] font-medium text-[#92400E]">
          Existing owner signatures will be cleared. All signers must sign again before submitting on-chain.
        </p>
      ) : null}
      <div className="mt-4 rounded-[8px] border border-[#E6E8EC] bg-[#FAFBFC] px-3 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7488]">
          {payload.mode === 'queue_jump_execute' ? 'Proposals skipped' : 'Earlier in queue'}
        </p>
        <BlockingProposalList ids={payload.blockingProposalIds} />
      </div>
    </AdminConfirmModal>
  )
}
