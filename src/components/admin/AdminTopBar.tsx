import arbitrumLogo from '@/assets/arbitrum_icon.jpeg.png'
import logo from '@/assets/logo.png'
import mobileHamburgerIcon from '@/assets/mobile-hamburger.png'
import mobileUserIcon from '@/assets/mobile-user.png'

interface AdminTopBarProps {
  title: string
  notificationUnread?: boolean
  onMenuClick?: () => void
  menuButtonAriaLabel?: string
  /** Truncated wallet address — when set, shows wallet chip (replaces legacy email row) */
  walletDisplay?: string
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

const iconButtonFrame =
  'h-[40px] w-[40px] border border-[#E6E8EC] rounded-[6px] text-[#4D5D80] flex items-center justify-center shrink-0 hover:bg-[#F9FAFB]'

const AdminTopBar = ({
  title,
  notificationUnread,
  onMenuClick,
  menuButtonAriaLabel,
  walletDisplay,
}: AdminTopBarProps) => {
  return (
    <header className="bg-white border-b border-[#E6E8EC] px-4 lg:px-6 py-4 lg:py-5">
      {/* Mobile / tablet: logo — bell, user, menu (title lives below bar in layout) */}
      <div className="flex lg:hidden items-center justify-between gap-3">
        <img
          src={logo}
          alt=""
          className="w-[45px] h-[40px] max-w-[45px] max-h-[40px] object-contain shrink-0"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className={['relative', iconButtonFrame].join(' ')}
            aria-label={notificationUnread ? 'Notifications, unread' : 'Notifications'}
          >
            <BellIcon className="w-5 h-5" />
            {notificationUnread ? (
              <span
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#F97316] ring-2 ring-white"
                aria-hidden
              />
            ) : null}
          </button>
          <button type="button" className={iconButtonFrame} aria-label="Account">
            <img src={mobileUserIcon} alt="" className="h-[19px] w-[19px] object-contain" />
          </button>
          {onMenuClick ? (
            <button
              type="button"
              className={iconButtonFrame}
              aria-label={menuButtonAriaLabel ?? 'Open navigation menu'}
              onClick={onMenuClick}
            >
              <img src={mobileHamburgerIcon} alt="" className="h-5 w-5 object-contain" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <h1 className="text-black font-semibold text-[18px] sm:text-[24px] leading-tight truncate min-w-0 flex-1">{title}</h1>
        <div className="flex items-center gap-3 shrink-0">
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

          {walletDisplay ? (
            <div
              className="min-h-[40px] px-4 border border-[#E6E8EC] rounded-[6px] flex items-center gap-3 text-[14px] shrink-0 bg-white max-w-none"
              aria-label={`Connected wallet ${walletDisplay} on Arbitrum One`}
            >
              <span className="font-medium text-[#1a1a1a] tracking-tight tabular-nums truncate">
                {walletDisplay}
              </span>
              <span className="h-5 w-px shrink-0 bg-[#E6E8EC]" aria-hidden />
              <img src={arbitrumLogo} alt="" className="h-5 w-5 shrink-0 object-contain" />
            </div>
          ) : (
            <button
              type="button"
              className="bg-[#195EBC] text-white px-5 min-h-[40px] rounded-[6px] text-[16px] font-medium shrink-0 inline-flex items-center"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminTopBar
