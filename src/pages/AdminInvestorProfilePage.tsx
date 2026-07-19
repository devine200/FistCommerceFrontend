import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { AdminProfileKycReviewBar } from '@/components/admin/kyc/AdminProfileKycReviewBar'
import { AdminKycDummyVerifyBar } from '@/components/admin/kyc/AdminKycDummyVerifyBar'
import { AdminPageFrame } from '@/components/admin/primitives'
import {
  ACTIVITY_FILTER_TABS,
  AdminInvestorActivityPanel,
  AdminInvestorInvestmentListPanel,
  AdminInvestorProfileSummary,
  buildInvestorProfileStatColumns,
  filterActivityLineItems,
  filterInvestmentLineItems,
  type ActivityFilterValue,
} from '@/components/admin/investors/profile'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import profileAvatarImage from '@/assets/Ellipse 5.png'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminInvestorProfile, selectInvestorProfile } from '@/store/slices/adminInvestorsSlice'

const INVESTORS_LIST_PATH = '/dashboard/admin/investors'

const AdminInvestorProfilePage = () => {
  const dispatch = useAppDispatch()
  const { investorId } = useParams<{ investorId: string }>()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const profileStatus = useAppSelector((s) => s.adminInvestors.profileStatus)
  const profileInvestorId = useAppSelector((s) => s.adminInvestors.profileInvestorId)
  const profile = useAppSelector((s) =>
    investorId ? selectInvestorProfile(s.adminInvestors, investorId) : null,
  )

  const [activeSearchInput, setActiveSearchInput] = useState('')
  const [historySearchInput, setHistorySearchInput] = useState('')
  const [activitySearchInput, setActivitySearchInput] = useState('')
  const [activityFilter, setActivityFilter] = useState<ActivityFilterValue>('all')

  const refreshProfile = () => {
    if (!investorId?.trim() || !accessToken?.trim() || sessionKind !== 'admin') return
    void dispatch(refreshAdminInvestorProfile({ investorUserId: investorId }))
  }

  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load full profile once per visit
  }, [dispatch, investorId, accessToken, sessionKind])

  const filteredActiveInvestments = useMemo(
    () => (profile ? filterInvestmentLineItems(profile.activeInvestments, activeSearchInput) : []),
    [profile, activeSearchInput],
  )

  const filteredInvestmentHistory = useMemo(
    () => (profile ? filterInvestmentLineItems(profile.investmentHistory, historySearchInput) : []),
    [profile, historySearchInput],
  )

  const filteredActivity = useMemo(
    () =>
      profile ? filterActivityLineItems(profile.activity, activityFilter, activitySearchInput) : [],
    [profile, activityFilter, activitySearchInput],
  )

  const profileLoadFailed = useMemo(
    () => profileStatus === 'failed' && profileInvestorId === investorId && !profile,
    [profile, profileInvestorId, profileStatus, investorId],
  )

  const profileLoading = useMemo(() => {
    if (!investorId) return false
    if (profile) return false
    if (profileLoadFailed) return false
    return true
  }, [investorId, profile, profileLoadFailed])

  const panelsLoading = profileStatus === 'loading' && !profile

  const { statColumns } = profile ? buildInvestorProfileStatColumns(profile) : { statColumns: [] }
  const activeSearchActive = activeSearchInput.trim().length > 0
  const historySearchActive = historySearchInput.trim().length > 0
  const activityFilterActive = activityFilter !== 'all' || activitySearchInput.trim().length > 0

  if (!investorId) {
    return <Navigate to={INVESTORS_LIST_PATH} replace />
  }

  return (
    <AdminPageFrame>
      <DashboardRequestFeedbackLayer
        phase={profileLoading ? 'loading' : 'idle'}
        loadingTitle="Loading investor profile"
        loadingDescription="Fetching investor profile, investments, and activity…"
        errorTitle="Unable to load investor profile"
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
            userType="investor"
            kycLabel={profile.kycLabel}
            kycVerified={profile.kycVerified}
            reviewed={profile.reviewed}
            pendingMultisigProposalId={profile.pendingMultisigProposalId}
            onReviewComplete={refreshProfile}
          />
          <AdminKycDummyVerifyBar
            wallet={profile.wallet}
            userType="investor"
            reviewed={profile.reviewed}
            onReviewComplete={refreshProfile}
          />
          <AdminInvestorProfileSummary
            avatarSrc={profileAvatarImage}
            displayName={profile.displayName}
            walletLabel={profile.walletLabel}
            statColumns={statColumns}
          />

          <AdminInvestorInvestmentListPanel
            investorId={investorId}
            title="Active Investments"
            items={filteredActiveInvestments}
            titleCountOverride={activeSearchActive ? filteredActiveInvestments.length : profile.activeInvestmentsCount}
            searchValue={activeSearchInput}
            onSearchChange={setActiveSearchInput}
            searchAriaLabel="Search active investments"
            loading={panelsLoading}
          />

          <AdminInvestorInvestmentListPanel
            investorId={investorId}
            title="Investment History"
            items={filteredInvestmentHistory}
            titleCountOverride={historySearchActive ? filteredInvestmentHistory.length : profile.investmentHistoryCount}
            searchValue={historySearchInput}
            onSearchChange={setHistorySearchInput}
            searchAriaLabel="Search investment history"
            loading={panelsLoading}
          />

          <AdminInvestorActivityPanel
            investorId={investorId}
            items={filteredActivity}
            titleCountOverride={activityFilterActive ? filteredActivity.length : profile.activityCount}
            searchValue={activitySearchInput}
            onSearchChange={setActivitySearchInput}
            activityFilter={activityFilter}
            onActivityFilterChange={setActivityFilter}
            filterTabs={[...ACTIVITY_FILTER_TABS]}
            loading={panelsLoading}
          />
        </>
      ) : null}
    </AdminPageFrame>
  )
}

export default AdminInvestorProfilePage
