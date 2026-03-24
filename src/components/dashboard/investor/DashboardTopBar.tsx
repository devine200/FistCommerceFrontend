import { Link } from 'react-router-dom'

import userOutlineIcon from '@/assets/ph_user.svg'

export interface DashboardBreadcrumbItem {
  label: string
  /** Omit `to` for the current (non-link) segment */
  to?: string
}

interface DashboardTopBarProps {
  title?: string
  breadcrumbs?: DashboardBreadcrumbItem[]
  /** Grey breadcrumb links (investor pool detail spec) */
  breadcrumbLinksMuted?: boolean
  /** Truncated address — when set, shows wallet chip instead of Connect Wallet */
  walletDisplay?: string
  /** Orange unread indicator on notifications */
  notificationUnread?: boolean
}

function ArbitrumMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#213147"
        d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2z"
      />
      <path
        fill="#28A0F0"
        d="M12 5.2L6.8 8.2v7.6L12 18.8l5.2-3V8.2L12 5.2zm0 1.6l3.6 2.1v4.2L12 15.2l-3.6-2.1v-4.2L12 6.8z"
      />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

const DashboardTopBar = ({
  title = 'Dashboard',
  breadcrumbs,
  breadcrumbLinksMuted,
  walletDisplay,
  notificationUnread,
}: DashboardTopBarProps) => {
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0)
  const lastCrumbIndex = hasBreadcrumbs ? breadcrumbs!.length - 1 : -1

  const linkClass = breadcrumbLinksMuted
    ? 'text-[#ACACAC] font-normal hover:text-[#6B7280] shrink-0'
    : 'text-[#195EBC] font-semibold hover:underline shrink-0'

  const leftContent = hasBreadcrumbs ? (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="m-0 p-0 list-none flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[24px] leading-tight">
        {breadcrumbs!.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-x-2 min-w-0 max-w-full">
            {i > 0 ? (
              <span className="text-[#ACACAC] font-normal text-[20px] select-none shrink-0" aria-hidden="true">
                &gt;
              </span>
            ) : null}
            {crumb.to ? (
              <Link to={crumb.to} className={linkClass}>
                {crumb.label}
              </Link>
            ) : (
              <span
                className={`text-black font-semibold truncate ${i === lastCrumbIndex ? 'max-w-[min(100%,28rem)]' : ''}`}
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  ) : (
    <h1 className="text-black font-semibold text-[24px] leading-tight truncate">{title}</h1>
  )

  return (
    <header className="bg-white border-b border-[#E6E8EC] px-6 py-5 flex items-center justify-between gap-6">
      <div className="min-w-0 flex-1">{leftContent}</div>

      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          className="relative h-[40px] w-[40px] border border-[#E6E8EC] rounded-[6px] text-[#4D5D80] flex items-center justify-center shrink-0 hover:bg-[#F9FAFB]"
          aria-label={notificationUnread ? 'Notifications, unread' : 'Notifications'}
        >
          <BellIcon />
          {notificationUnread ? (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F97316] ring-2 ring-white"
              aria-hidden
            />
          ) : null}
        </button>

        <div className="min-h-[40px] px-4 border border-[#E6E8EC] rounded-[6px] flex items-center gap-3 text-[16px] text-[#4D5D80] shrink-0 bg-white">
          <span className="truncate max-w-[200px]">user1234@gmail.com</span>
          <span className="h-5 w-px shrink-0 bg-[#E6E8EC]" aria-hidden />
          <img src={userOutlineIcon} alt="" className="w-[18px] h-[18px] shrink-0 opacity-80" />
        </div>

        {walletDisplay ? (
          <div
            className="min-h-[40px] px-4 border border-[#E6E8EC] rounded-[6px] flex items-center gap-3 text-[16px] text-[#4D5D80] shrink-0 bg-white"
            aria-label={`Connected wallet ${walletDisplay} on Arbitrum One`}
          >
            <span className="font-medium text-[#1a1a1a] tracking-tight tabular-nums">{walletDisplay}</span>
            <span className="h-5 w-px shrink-0 bg-[#E6E8EC]" aria-hidden />
            <ArbitrumMark className="shrink-0" />
          </div>
        ) : (
          <button
            type="button"
            className="bg-[#195EBC] text-white px-5 min-h-[40px] rounded-[6px] text-[16px] font-medium shrink-0"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  )
}

export default DashboardTopBar
