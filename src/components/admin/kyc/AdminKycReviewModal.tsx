import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { KycReviewStatus, KycReviewUserType } from '@/api/adminKycReview'
import {
  PrivilegedActionFeedbackLayer,
  type PrivilegedActionPhase,
} from '@/admin/governance/PrivilegedActionFeedbackLayer'
import type { ResolvedGovernanceOutcome } from '@/admin/governance/types'
import { adminGovernanceProposalPath } from '@/api/adminActionResponse'
import { isAbortError } from '@/utils/abortError'

type AdminKycReviewModalProps = {
  open: boolean
  wallet: string
  displayName: string
  userType: KycReviewUserType
  pendingProposalId?: string | null
  onClose: () => void
  onSubmit: (status: KycReviewStatus, signal: AbortSignal) => Promise<ResolvedGovernanceOutcome>
}

export function AdminKycReviewModal({
  open,
  wallet,
  displayName,
  userType,
  pendingProposalId,
  onClose,
  onSubmit,
}: AdminKycReviewModalProps) {
  const navigate = useNavigate()
  const abortRef = useRef<AbortController | null>(null)
  const [phase, setPhase] = useState<PrivilegedActionPhase>('idle')
  const [pendingStatus, setPendingStatus] = useState<KycReviewStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<ResolvedGovernanceOutcome | null>(null)

  const resetFeedback = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase('idle')
    setPendingStatus(null)
    setError(null)
    setOutcome(null)
  }, [])

  const handleClose = useCallback(() => {
    resetFeedback()
    onClose()
  }, [onClose, resetFeedback])

  const cancelLoading = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase('idle')
    setPendingStatus(null)
    setError(null)
    setOutcome(null)
  }, [])

  if (!open) return null

  const blocked = Boolean(pendingProposalId?.trim())
  const isReject = pendingStatus === 'Rejected'

  const run = async (status: KycReviewStatus) => {
    if (blocked || phase === 'loading') return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setPendingStatus(status)
    setPhase('loading')
    setError(null)
    setOutcome(null)
    try {
      const result = await onSubmit(status, controller.signal)
      if (controller.signal.aborted) return
      setOutcome(result)
      setPhase('succeeded')
    } catch (e) {
      if (isAbortError(e) || controller.signal.aborted) {
        setPhase('idle')
        return
      }
      setError(e instanceof Error ? e.message : 'Could not submit KYC review.')
      setPhase('failed')
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }

  const handleRetry = () => {
    if (!pendingStatus) return
    void run(pendingStatus)
  }

  return (
    <>
      <PrivilegedActionFeedbackLayer
        phase={phase}
        resolvedOutcome={outcome}
        loadingTitle={isReject ? 'Rejecting KYC' : 'Approving KYC'}
        loadingDescription={
          isReject
            ? 'Submitting KYC rejection…'
            : 'Submitting KYC approval. This may create a governance proposal…'
        }
        errorTitle={isReject ? 'Unable to reject KYC' : 'Unable to approve KYC'}
        errorDescription={error ?? undefined}
        directSuccessTitle={isReject ? 'KYC rejected' : 'KYC approved'}
        onDismiss={handleClose}
        onRetry={handleRetry}
        onCancelLoading={cancelLoading}
      />

      {phase === 'idle' ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5">
          <div
            role="dialog"
            aria-labelledby="kyc-review-title"
            className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl"
          >
            <h3 id="kyc-review-title" className="text-[#0B1220] text-[18px] font-bold">
              Review KYC — {displayName}
            </h3>
            <p className="mt-2 text-[#6B7488] text-[14px] font-mono break-all">{wallet}</p>
            <p className="mt-1 text-[#6B7488] text-[13px] capitalize">{userType}</p>

            {blocked ? (
              <p className="mt-4 text-[#B45309] text-[14px]">
                A governance proposal is already pending for this record.{' '}
                {pendingProposalId ? (
                  <button
                    type="button"
                    className="text-[#195EBC] font-semibold hover:underline"
                    onClick={() => navigate(adminGovernanceProposalPath(pendingProposalId))}
                  >
                    Review proposal
                  </button>
                ) : null}
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={blocked}
                onClick={() => void run('Rejected')}
                className="h-11 rounded-[8px] bg-[#FEE2E2] text-[#DC2626] text-[14px] font-semibold disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={blocked}
                onClick={() => void run('Verified')}
                className="h-11 rounded-[8px] bg-[#195EBC] text-white text-[14px] font-semibold disabled:opacity-50"
              >
                Approve
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 w-full h-10 text-[#6B7488] text-[14px] font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
