import { Link } from 'react-router-dom'

const crumbTitle = 'text-[18px] sm:text-[24px] font-semibold leading-tight'

export type AdminInvestorActivityDetailBreadcrumbProps = {
  listHref: string
  profileHref: string
  listLabel?: string
  profileLabel?: string
  currentLabel?: string
}

export function AdminInvestorActivityDetailBreadcrumb({
  listHref,
  profileHref,
  listLabel = 'Investor',
  profileLabel = 'Investor Profile',
  currentLabel = 'Investment Details',
}: AdminInvestorActivityDetailBreadcrumbProps) {
  return (
    <nav
      className={['flex flex-wrap items-center gap-x-2 min-w-0 w-full text-black', crumbTitle].join(' ')}
      aria-label="Breadcrumb"
    >
      <Link to={listHref} className="shrink-0 text-black hover:text-[#195EBC] transition-colors">
        {listLabel}
      </Link>
      <span className="text-black/45 font-semibold shrink-0" aria-hidden>
        &gt;
      </span>
      <Link to={profileHref} className="shrink-0 text-black hover:text-[#195EBC] transition-colors truncate min-w-0">
        {profileLabel}
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
