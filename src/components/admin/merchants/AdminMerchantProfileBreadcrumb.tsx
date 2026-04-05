import { Link } from 'react-router-dom'

const crumbTitle = 'text-[18px] sm:text-[24px] font-semibold leading-tight'

export type AdminMerchantProfileBreadcrumbProps = {
  listHref: string
  listLabel?: string
  currentLabel?: string
}

export function AdminMerchantProfileBreadcrumb({
  listHref,
  listLabel = 'Merchants',
  currentLabel = 'Merchant Profile',
}: AdminMerchantProfileBreadcrumbProps) {
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
