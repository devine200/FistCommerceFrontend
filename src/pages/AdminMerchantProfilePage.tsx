import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { AdminProfileKycReviewBar } from '@/components/admin/kyc/AdminProfileKycReviewBar'
import { AdminMerchantProfileView } from '@/components/admin/merchants'
import { AdminPageFrame } from '@/components/admin/primitives'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
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

  if (profileLoading) {
    return (
      <div className="fixed inset-0 z-75">
        <DashboardFullPageLoading label="Loading merchant profile…" />
      </div>
    )
  }

  if (!profile) {
    return <AdminPageFrame>{null}</AdminPageFrame>
  }

  return (
    <AdminPageFrame>
      <AdminProfileKycReviewBar
        userId={Number(profile.id)}
        kycId={profile.kycId}
        wallet={profile.wallet}
        displayName={profile.displayName}
        userType="merchant"
        kycLabel={profile.kycLabel}
        pendingMultisigProposalId={profile.pendingMultisigProposalId}
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
    </AdminPageFrame>
  )
}

export default AdminMerchantProfilePage
