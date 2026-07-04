import { useCallback, useEffect, useMemo, useState } from 'react'

import { toUserFacingError } from '@/api/client'
import { fetchMerchantProfile, type MerchantProfileInfo } from '@/api/onboardingProfile'
import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'
import { DashboardRequestFeedbackLayer } from '@/components/dashboard/shared/DashboardRequestFeedbackLayer'
import { useAppSelector } from '@/store/hooks'

import type { MerchantProfileOverviewContentProps } from './types'

type ProfileLoadState = 'idle' | 'loading' | 'ready' | 'error'

function MerchantProfileOverviewContent({ stats, tabs }: MerchantProfileOverviewContentProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const authUserEmail = useAppSelector((s) => s.auth.user?.email?.trim())

  const [profile, setProfile] = useState<MerchantProfileInfo | null>(null)
  const [profileLoad, setProfileLoad] = useState<ProfileLoadState>('idle')
  const [profileError, setProfileError] = useState<string | null>(null)

  const loadProfile = useCallback(() => {
    const token = accessToken?.trim()
    if (!token) {
      setProfile(null)
      setProfileLoad('idle')
      setProfileError(null)
      return
    }

    setProfileLoad('loading')
    setProfileError(null)
    void fetchMerchantProfile(token)
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
    return 'Merchant'
  }, [profile?.fullname, profileLoad])

  const displayEmail = useMemo(() => {
    const fromProfile = profile?.email?.trim()
    if (fromProfile) return fromProfile
    if (authUserEmail) return authUserEmail
    if (profileLoad === 'loading') return 'Loading…'
    return '—'
  }, [authUserEmail, profile?.email, profileLoad])

  const feedbackPhase = profileLoad === 'loading' ? 'loading' : profileLoad === 'error' ? 'failed' : 'idle'

  return (
    <div className="flex flex-col gap-4">
      <DashboardRequestFeedbackLayer
        phase={feedbackPhase}
        loadingTitle="Loading profile"
        loadingDescription="Fetching your merchant profile…"
        errorTitle="Unable to load profile"
        errorDescription={profileError ?? undefined}
        onDismiss={() => setProfileLoad(profile ? 'ready' : 'idle')}
        onRetry={loadProfile}
      />

      <InvestorProfileHero name={displayName} email={displayEmail} />
      <InvestorProfileStatsGrid stats={stats} />
      <InvestorProfileTabs tabs={tabs} />
    </div>
  )
}

export default MerchantProfileOverviewContent
export type { MerchantProfileOverviewContentProps } from './types'
