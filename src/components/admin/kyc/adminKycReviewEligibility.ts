import type { KycReviewUserType } from '@/api/adminKycReview'

/** Admin KYC decision is final when status label reflects on-chain review outcome. */
export function isAdminKycReviewFinalized(kycLabel: string): boolean {
  const normalized = kycLabel.trim().toLowerCase()
  return normalized === 'verified' || normalized === 'approved' || normalized === 'rejected'
}

function isUnderReviewKycLabel(label: string): boolean {
  return label.trim().toLowerCase().includes('under review')
}

export function canEnableAdminKycReviewButton(params: {
  userType: KycReviewUserType
  kycVerified: boolean
  insuranceVerified?: boolean
  reviewed: boolean
  governancePending?: boolean
  kycLabel?: string
}): boolean {
  if (params.reviewed) return false

  if (
    params.governancePending &&
    isUnderReviewKycLabel(params.kycLabel ?? '')
  ) {
    return true
  }

  if (params.userType === 'investor') {
    return params.kycVerified
  }
  return params.kycVerified && Boolean(params.insuranceVerified)
}
