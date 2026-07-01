import { useState } from 'react'

import {
  postAdminKycReview,
  resolveAdminKycId,
  type KycReviewStatus,
  type KycReviewUserType,
} from '@/api/adminKycReview'
import { submitAdminAction } from '@/admin/governance/submitAdminAction'
import { AdminGovernanceStatusBadge } from '@/admin/governance/AdminGovernanceStatusBadge'
import { AdminKycReviewModal } from '@/components/admin/kyc/AdminKycReviewModal'
import { AdminPanel, AdminStatusPill, type AdminPillVariant } from '@/components/admin/primitives'
import { useAppSelector } from '@/store/hooks'

type AdminProfileKycReviewBarProps = {
  userId: number
  kycId: string | null
  wallet: string
  displayName: string
  userType: KycReviewUserType
  kycLabel: string
  kycPillVariant?: AdminPillVariant
  pendingMultisigProposalId: string | null
  onReviewComplete: () => void
}

function kycLabelToPillVariant(label: string): AdminPillVariant {
  const normalized = label.trim().toLowerCase()
  if (normalized === 'verified' || normalized === 'approved') return 'approved'
  if (normalized === 'rejected') return 'rejected'
  if (normalized.includes('under review')) return 'underReview'
  if (normalized === 'pending') return 'pending'
  return 'neutral'
}

export function AdminProfileKycReviewBar({
  userId,
  kycId,
  wallet,
  displayName,
  userType,
  kycLabel,
  kycPillVariant,
  pendingMultisigProposalId,
  onReviewComplete,
}: AdminProfileKycReviewBarProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [modalOpen, setModalOpen] = useState(false)
  const pillVariant = kycPillVariant ?? kycLabelToPillVariant(kycLabel)
  const governancePending = Boolean(pendingMultisigProposalId?.trim())

  return (
    <>
      <AdminPanel className="px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#6B7488] text-[13px] font-medium">KYC</span>
            <AdminStatusPill variant={pillVariant}>{kycLabel}</AdminStatusPill>
            <AdminGovernanceStatusBadge
              proposalId={pendingMultisigProposalId}
              governanceStatus={governancePending ? 'pending_signatures' : 'none'}
            />
          </div>
          <button
            type="button"
            className="h-10 px-5 rounded-[6px] bg-[#195EBC] text-white text-[14px] font-semibold hover:bg-[#154a9a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            disabled={governancePending}
            onClick={() => setModalOpen(true)}
          >
            Review KYC
          </button>
        </div>
      </AdminPanel>

      <AdminKycReviewModal
        open={modalOpen}
        wallet={wallet}
        displayName={displayName}
        userType={userType}
        pendingProposalId={pendingMultisigProposalId}
        onClose={() => setModalOpen(false)}
        onSubmit={async (status: KycReviewStatus, signal: AbortSignal) => {
          if (!accessToken?.trim()) {
            throw new Error('Missing admin session.')
          }
          const resolvedKycId = await resolveAdminKycId(accessToken, {
            kycId,
            userId,
            userType,
          })
          if (signal.aborted) {
            throw new DOMException('Aborted', 'AbortError')
          }
          const resolved = await submitAdminAction(
            () =>
              postAdminKycReview(
                accessToken,
                {
                  kycId: resolvedKycId,
                  status,
                },
                { signal },
              ),
            { operationType: 'kyc_status' },
          )
          onReviewComplete()
          return resolved
        }}
      />
    </>
  )
}
