import { useCallback, useRef, useState } from 'react'

import { toUserFacingError } from '@/api/client'
import {
  postAdminKycVerify,
  resolveAdminKycId,
} from '@/api/adminKycReview'
import { submitAdminAction } from '@/admin/governance/submitAdminAction'
import {
  PrivilegedActionFeedbackLayer,
  type PrivilegedActionPhase,
} from '@/admin/governance/PrivilegedActionFeedbackLayer'
import type { ResolvedGovernanceOutcome } from '@/admin/governance/types'
import { AdminPanel, AdminStatusPill } from '@/components/admin/primitives'
import { useAppSelector } from '@/store/hooks'
import { isAbortError } from '@/utils/abortError'

type AdminMerchantInsuranceReviewBarProps = {
  userId: number
  wallet: string
  kycId: string | null
  kycVerified: boolean
  insuranceVerified: boolean
  diditStatus: string | null
  reviewed?: boolean
  onReviewComplete: () => void
}

export function AdminMerchantInsuranceReviewBar({
  userId,
  wallet,
  kycId,
  kycVerified,
  insuranceVerified,
  diditStatus,
  reviewed = false,
  onReviewComplete,
}: AdminMerchantInsuranceReviewBarProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const abortRef = useRef<AbortController | null>(null)
  const [phase, setPhase] = useState<PrivilegedActionPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<ResolvedGovernanceOutcome | null>(null)

  const diditApproved = (diditStatus || '').trim() === 'Approved'
  const canEdit = !reviewed

  const resetFeedback = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase('idle')
    setError(null)
    setOutcome(null)
  }, [])

  const runVerify = async (insuranceOk: boolean) => {
    if (!canEdit || phase === 'loading') return
    const token = accessToken?.trim()
    if (!token) {
      setError('Missing admin session.')
      setPhase('failed')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('loading')
    setError(null)
    setOutcome(null)

    try {
      const resolvedKycId = await resolveAdminKycId(token, {
        kycId,
        wallet,
        userId,
        userType: 'merchant',
        signal: controller.signal,
      })
      if (controller.signal.aborted) return

      const markKycVerified = insuranceOk && diditApproved

      const resolved = await submitAdminAction(
        () =>
          postAdminKycVerify(
            token,
            {
              kycId: resolvedKycId,
              insuranceVerified: insuranceOk,
              kycVerified: markKycVerified,
            },
            { signal: controller.signal },
          ),
        { operationType: 'kyc_status' },
      )
      if (controller.signal.aborted) return
      setOutcome(resolved)
      setPhase('succeeded')
      onReviewComplete()
    } catch (e) {
      if (isAbortError(e) || controller.signal.aborted) {
        setPhase('idle')
        return
      }
      setError(toUserFacingError(e, 'Could not update insurance verification.'))
      setPhase('failed')
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }

  const insurancePill = insuranceVerified ? 'approved' : kycVerified && diditApproved ? 'underReview' : 'pending'

  return (
    <>
      <PrivilegedActionFeedbackLayer
        phase={phase}
        resolvedOutcome={outcome}
        loadingTitle="Updating insurance verification"
        loadingDescription="Saving merchant insurance and KYB audit flags…"
        errorTitle="Unable to update insurance verification"
        errorDescription={error ?? undefined}
        directSuccessTitle="Insurance verification updated"
        onDismiss={resetFeedback}
        onRetry={() => void runVerify(true)}
        onCancelLoading={resetFeedback}
      />

      <AdminPanel className="px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span className="text-[#6B7488] text-[13px] font-medium">Insurance &amp; KYB audit</span>
            <AdminStatusPill variant={insurancePill}>
              {insuranceVerified ? 'Insurance verified' : 'Insurance pending'}
            </AdminStatusPill>
            {diditStatus ? (
              <span className="text-[#6B7488] text-[12px]">Didit: {diditStatus}</span>
            ) : null}
            {kycVerified ? (
              <AdminStatusPill variant="approved">KYB marked verified</AdminStatusPill>
            ) : null}
          </div>
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={phase === 'loading' || insuranceVerified}
                onClick={() => void runVerify(true)}
                className="h-10 px-5 rounded-[6px] bg-[#195EBC] text-white text-[14px] font-semibold hover:bg-[#154a9a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Verify insurance
              </button>
              <button
                type="button"
                disabled={phase === 'loading' || !insuranceVerified}
                onClick={() => void runVerify(false)}
                className="h-10 px-5 rounded-[6px] border border-[#E6E8EC] text-[#374151] text-[14px] font-semibold hover:bg-[#F6F7FB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear insurance
              </button>
            </div>
          ) : (
            <span className="text-[#6B7488] text-[13px]">KYC record already reviewed.</span>
          )}
        </div>
        {diditApproved && !insuranceVerified ? (
          <p className="mt-3 text-[#92400E] text-[13px]">
            Didit KYB is approved. Verify insurance here to allow on-chain merchant approval to complete.
          </p>
        ) : null}
      </AdminPanel>
    </>
  )
}
