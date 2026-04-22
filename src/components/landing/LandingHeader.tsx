import { Link } from 'react-router-dom'

import { FistCommerceLogo } from '@/components/landing/FistCommerceLogo'

export type LandingHeaderProps = {
  fundingHref?: string
  investingHref?: string
}

export function LandingHeader({
  fundingHref = '/onboarding/choose-role',
  investingHref = '/onboarding/choose-role',
}: LandingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060d18]/90 backdrop-blur-md">
      <div className="mx-auto flex w-[90%] items-center justify-between gap-3 py-3">
        <FistCommerceLogo />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to={fundingHref}
            className="rounded-lg bg-[#0b1628] px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-[#111f35] sm:px-4 sm:text-sm"
          >
            Get funding
          </Link>
          <Link
            to={investingHref}
            className="rounded-lg bg-[#1d6cff] px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/35 transition hover:bg-[#3b7fff] sm:px-4 sm:text-sm"
          >
            Start investing
          </Link>
        </div>
      </div>
    </header>
  )
}
