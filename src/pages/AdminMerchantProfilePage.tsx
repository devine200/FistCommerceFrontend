import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { AdminProfileKycReviewBar } from '@/components/admin/kyc/AdminProfileKycReviewBar'
import { AdminMerchantInsuranceReviewBar } from '@/components/admin/kyc/AdminMerchantInsuranceReviewBar'
import { AdminKycDummyVerifyBar } from '@/components/admin/kyc/AdminKycDummyVerifyBar'
import { isAdminKycReviewFinalized } from '@/components/admin/kyc/adminKycReviewEligibility'
import { AdminMerchantProfileView } from '@/components/admin/merchants'
import { AdminPageFrame } from '@/components/admin/primitives'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import profileAvatarImage from '@/assets/Ellipse 5.png'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminMerchantProfile, selectMerchantProfile } from '@/store/slices/adminMerchantsSlice'

const MERCHANTS_LIST_PATH = '/dashboard/admin/merchants'

const AdminMerchantProfilePage = () => {
  const dispatch = useAppDispatch()
  const { merchantId } = useParams<{ merchantId: string }>()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const profileStatus = useAppSelector((s) => s.adminMerchants.profileStatus)
  const profileMerchantId = useAppSelector((s) => s.adminMerchants.profileMerchantId)
  const profile = useAppSelector((s) =>
    merchantId ? selectMerchantProfile(s.adminMerchants, merchantId) : null,
  )

  const [activeSearchInput, setActiveSearchInput] = useState('')
  const [allSearchInput, setAllSearchInput] = useState('')

  const refreshProfile = () => {
    if (!merchantId?.trim() || !accessToken?.trim() || sessionKind !== 'admin') return
    void dispatch(refreshAdminMerchantProfile({ merchantUserId: merchantId }))
  }

  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load full profile once per visit
  }, [dispatch, merchantId, accessToken, sessionKind])

  const profileLoadFailed = useMemo(
    () => profileStatus === 'failed' && profileMerchantId === merchantId && !profile,
    [profile, profileMerchantId, profileStatus, merchantId],
  )

  const profileLoading = useMemo(() => {
    if (!merchantId) return false
    if (profile) return false
    if (profileLoadFailed) return false
    return true
  }, [merchantId, profile, profileLoadFailed])

  if (!merchantId) {
    return <Navigate to={MERCHANTS_LIST_PATH} replace />
  }

  return (
    <AdminPageFrame>
      <DashboardRequestFeedbackLayer
        phase={profileLoading ? 'loading' : 'idle'}
        loadingTitle="Loading merchant profile"
        loadingDescription="Fetching merchant profile, receivables, and KYC status…"
        errorTitle="Unable to load merchant profile"
        onDismiss={() => {}}
        onCancelLoading={() => {}}
      />

      {profile ? (
        <>
          <AdminProfileKycReviewBar
            userId={Number(profile.id)}
            kycId={profile.kycId}
            wallet={profile.wallet}
            displayName={profile.displayName}
            userType="merchant"
            kycLabel={profile.kycLabel}
            kycVerified={profile.kycVerified}
            insuranceVerified={profile.insuranceVerified}
            reviewed={isAdminKycReviewFinalized(profile.kycLabel)}
            pendingMultisigProposalId={profile.pendingMultisigProposalId}
            onReviewComplete={refreshProfile}
          />
          <AdminMerchantInsuranceReviewBar
            userId={Number(profile.id)}
            wallet={profile.wallet}
            kycId={profile.kycId}
            kycVerified={profile.kycVerified}
            insuranceVerified={profile.insuranceVerified}
            diditStatus={profile.diditStatus}
            reviewed={isAdminKycReviewFinalized(profile.kycLabel)}
            onReviewComplete={refreshProfile}
          />
          <AdminKycDummyVerifyBar
            wallet={profile.wallet}
            userType="merchant"
            reviewed={isAdminKycReviewFinalized(profile.kycLabel)}
            onReviewComplete={refreshProfile}
          />
      <AdminMerchantProfileView
        avatarSrc={profileAvatarImage}
        profile={profile}
        activeSearchValue={activeSearchInput}
        onActiveSearchChange={setActiveSearchInput}
        allSearchValue={allSearchInput}
        onAllSearchChange={setAllSearchInput}
        receivablesLoading={profileStatus === 'loading' && !profile}
      />
        </>
      ) : null}
    </AdminPageFrame>
  )
}

export default AdminMerchantProfilePage
