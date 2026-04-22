import { useEffect, useMemo, useState } from 'react'

import { fetchMerchantProfile, type MerchantProfileInfo } from '@/api/onboardingProfile'
import InvestorProfileHero from '@/components/dashboard/investor/profile/InvestorProfileHero'
import InvestorProfileStatsGrid from '@/components/dashboard/investor/profile/InvestorProfileStatsGrid'
import InvestorProfileTabs from '@/components/dashboard/investor/profile/InvestorProfileTabs'
import { useAppSelector } from '@/store/hooks'

import type { MerchantProfileOverviewContentProps } from './types'

type ProfileLoadState = 'idle' | 'loading' | 'ready' | 'error'

function MerchantProfileOverviewContent({ stats, tabs }: MerchantProfileOverviewContentProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const authUserEmail = useAppSelector((s) => s.auth.user?.email?.trim())

  const [profile, setProfile] = useState<MerchantProfileInfo | null>(null)
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
        const data = await fetchMerchantProfile(accessToken)
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
    return 'Merchant'
  }, [profile?.fullname, profileLoad])

  const displayEmail = useMemo(() => {
    const fromProfile = profile?.email?.trim()
    if (fromProfile) return fromProfile
    if (authUserEmail) return authUserEmail
    if (profileLoad === 'loading') return 'Loading…'
    return '—'
  }, [authUserEmail, profile?.email, profileLoad])

  return (
    <div className="flex flex-col gap-4">
      <InvestorProfileHero name={displayName} email={displayEmail} />
      {profileError ? (
        <p className="text-[#B91C1C] text-[14px] px-1" role="alert">
          {profileError}
        </p>
      ) : null}
      <InvestorProfileStatsGrid stats={stats} />
      <InvestorProfileTabs tabs={tabs} />
    </div>
  )
}

export default MerchantProfileOverviewContent
export type { MerchantProfileOverviewContentProps } from './types'
