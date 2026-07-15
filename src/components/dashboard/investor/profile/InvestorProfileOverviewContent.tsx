import { useCallback, useEffect, useMemo, useState } from 'react'

import { toUserFacingError } from '@/api/client'
import { fetchInvestorProfile, type InvestorProfileInfo } from '@/api/onboardingProfile'
import { isUsableApiAccessToken } from '@/auth/accessTokenPolicy'
import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'
import {
  buildInvestorProfileStatsFromApi,
  INVESTOR_PROFILE_TABS,
} from '@/components/dashboard/investor/profile/profileConfig'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import { useInvestorOnChainBalances } from '@/hooks/useInvestorOnChainBalances'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshInvestorDashboard } from '@/store/slices/investorDashboardSlice'

type ProfileLoadState = 'idle' | 'loading' | 'ready' | 'error'

const InvestorProfileOverviewContent = () => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const authUserEmail = useAppSelector((s) => s.auth.user?.email?.trim())
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)
  const dashboardMetricsStatus = useAppSelector((s) => s.investorDashboard.status)
  const { investmentBalanceDisplay } = useInvestorOnChainBalances()

  const [profile, setProfile] = useState<InvestorProfileInfo | null>(null)
  const [profileLoad, setProfileLoad] = useState<ProfileLoadState>('idle')
  const [profileError, setProfileError] = useState<string | null>(null)

  const loadProfile = useCallback(() => {
    const token = accessToken?.trim()
    if (!isUsableApiAccessToken(token)) {
      setProfile(null)
      setProfileLoad('idle')
      setProfileError(null)
      return
    }

    setProfileLoad('loading')
    setProfileError(null)
    void fetchInvestorProfile(token)
      .then((data) => {
        setProfile(data)
        setProfileLoad('ready')
      })
      .catch((e) => {
        setProfile(null)
        setProfileLoad('error')
        setProfileError(toUserFacingError(e, 'Could not load profile'))
      })
  }, [accessToken])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const displayName = useMemo(() => {
    if (profileLoad === 'loading') return 'Loading profile…'
    const n = profile?.fullname?.trim()
    if (n) return n
    return 'Investor'
  }, [profile?.fullname, profileLoad])

  const displayEmail = useMemo(() => {
    const fromProfile = profile?.email?.trim()
    if (fromProfile) return fromProfile
    if (authUserEmail) return authUserEmail
    if (profileLoad === 'error') return '—'
    if (profileLoad === 'loading') return 'Loading…'
    if (profileLoad === 'ready' && !profile) return 'Complete your profile to add an email.'
    return '—'
  }, [authUserEmail, profile?.email, profile, profileLoad])

  const stats = useMemo(
    () => buildInvestorProfileStatsFromApi(investorMetrics, investmentBalanceDisplay),
    [investorMetrics, investmentBalanceDisplay],
  )

  const metricsSyncHint =
    dashboardMetricsStatus === 'loading' && !investorMetrics
      ? 'Portfolio metrics are updating…'
      : dashboardMetricsStatus === 'succeeded' && !investorMetrics
        ? 'Portfolio metrics are not available yet.'
        : null

  const feedbackPhase = profileLoad === 'loading' ? 'loading' : profileLoad === 'error' ? 'failed' : 'idle'

  return (
    <div className="flex flex-col gap-4 pb-8">
      <DashboardRequestFeedbackLayer
        phase={feedbackPhase}
        loadingTitle="Loading profile"
        loadingDescription="Fetching your investor profile…"
        errorTitle="Unable to load profile"
        errorDescription={profileError ?? undefined}
        onDismiss={() => setProfileLoad(profile ? 'ready' : 'idle')}
        onRetry={loadProfile}
      />

      <InvestorProfileHero name={displayName} email={displayEmail} />
      {metricsSyncHint ? (
        <p className="text-[#6B7488] text-[13px] px-1" role="status">
          {metricsSyncHint}
        </p>
      ) : null}
      <InvestorProfileStatsGrid stats={stats} />
      <InvestorProfileTabs tabs={INVESTOR_PROFILE_TABS} />
      {dashboardMetricsStatus === 'failed' ? (
        <button
          type="button"
          onClick={() => void dispatch(refreshInvestorDashboard())}
          className="text-[#195EBC] text-[13px] font-semibold w-fit hover:underline"
        >
          Retry portfolio metrics sync
        </button>
      ) : null}
    </div>
  )
}

export default InvestorProfileOverviewContent
