import { useEffect, useMemo, useState } from 'react'

import { fetchInvestorProfile, type InvestorProfileInfo } from '@/api/onboardingProfile'
import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'
import {
  buildInvestorProfileStatsFromApi,
  INVESTOR_PROFILE_TABS,
} from '@/components/dashboard/investor/profile/profileConfig'
import { useAppSelector } from '@/store/hooks'

type ProfileLoadState = 'idle' | 'loading' | 'ready' | 'error'

const InvestorProfileOverviewContent = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const authUserEmail = useAppSelector((s) => s.auth.user?.email?.trim())
  const investorMetrics = useAppSelector((s) => s.investorDashboard.investorMetrics)
  const dashboardMetricsStatus = useAppSelector((s) => s.investorDashboard.status)

  const [profile, setProfile] = useState<InvestorProfileInfo | null>(null)
  const [profileLoad, setProfileLoad] = useState<ProfileLoadState>('idle')
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken?.trim()) {
      setProfile(null)
      setProfileLoad('idle')
      setProfileError(null)
      return
    }

    let cancelled = false
    setProfileLoad('loading')
    setProfileError(null)

    void (async () => {
      try {
        const data = await fetchInvestorProfile(accessToken)
        if (cancelled) return
        setProfile(data)
        setProfileLoad('ready')
      } catch (e) {
        if (cancelled) return
        setProfile(null)
        setProfileLoad('error')
        setProfileError(e instanceof Error ? e.message : 'Could not load profile')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessToken])

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

  const stats = useMemo(() => buildInvestorProfileStatsFromApi(investorMetrics), [investorMetrics])

  const metricsSyncHint =
    dashboardMetricsStatus === 'loading' && !investorMetrics
      ? 'Portfolio metrics are updating…'
      : dashboardMetricsStatus === 'succeeded' && !investorMetrics
        ? 'Portfolio metrics are not available yet.'
        : null

  return (
    <div className="flex flex-col gap-4 pb-8">
      <InvestorProfileHero name={displayName} email={displayEmail} />
      {profileError ? (
        <p className="text-[#B91C1C] text-[14px] px-1" role="alert">
          {profileError}
        </p>
      ) : null}
      {metricsSyncHint ? (
        <p className="text-[#6B7488] text-[13px] px-1" role="status">
          {metricsSyncHint}
        </p>
      ) : null}
      <InvestorProfileStatsGrid stats={stats} />
      <InvestorProfileTabs tabs={INVESTOR_PROFILE_TABS} />
    </div>
  )
}

export default InvestorProfileOverviewContent
