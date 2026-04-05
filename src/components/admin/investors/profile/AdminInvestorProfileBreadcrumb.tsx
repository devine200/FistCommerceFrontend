import { Link } from 'react-router-dom'

import type { AdminInvestorProfileBreadcrumbProps } from './types'

/** Matches `AdminTopBar` page title: size, weight, and primary text color. */
const crumbTitle = 'text-[18px] sm:text-[24px] font-semibold leading-tight'

export function AdminInvestorProfileBreadcrumb({
  listHref,
  listLabel = 'Investor',
  currentLabel = 'Investor Profile',
}: AdminInvestorProfileBreadcrumbProps) {
  return (
    <nav className={['flex flex-wrap items-center gap-x-2 min-w-0 w-full text-black', crumbTitle].join(' ')} aria-label="Breadcrumb">
      <Link to={listHref} className="shrink-0 text-black hover:text-[#195EBC] transition-colors">
        {listLabel}
      </Link>
      <span className="text-black/45 font-semibold shrink-0" aria-hidden>
        &gt;
      </span>
      <span className="text-black truncate min-w-0" aria-current="page">
        {currentLabel}
      </span>
    </nav>
  )
}
