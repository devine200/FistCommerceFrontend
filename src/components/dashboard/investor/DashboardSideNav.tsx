import logo from '@/assets/logo.png'
import squaresFourIcon from '@/assets/SquaresFour.svg'
import coinIcon from '@/assets/Coin.svg'
import userIcon from '@/assets/ph_user.svg'
import documentNavIcon from '@/assets/Frame 1000004246.png'
import collapseArrowIcon from '@/assets/CollapseArrow.svg'
import type { DashboardBasePath } from '@/layouts/DashboardLayout'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  icon: string
  isActive: boolean
  /** Tailwind size classes when the asset reads smaller than SVG icons (default 24px). */
  iconSizeClass?: string
}

function resolveDashboardBase(pathname: string, explicit?: DashboardBasePath): DashboardBasePath {
  if (explicit) return explicit
  if (pathname.startsWith('/dashboard/merchant')) return '/dashboard/merchant'
  return '/dashboard/investor'
}

interface DashboardSideNavProps {
  basePath?: DashboardBasePath
  /** When provided, renders a close button (useful for mobile drawer). */
  onRequestClose?: () => void
}

const DashboardSideNav = ({ basePath: basePathProp, onRequestClose }: DashboardSideNavProps) => {
  const location = useLocation()
  const pathname = location.pathname

  const base = resolveDashboardBase(pathname, basePathProp)

  const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const isPoolHowItWorks = new RegExp(`^${escapedBase}/lending-pool/[^/]+/how-it-works$`).test(pathname)
  const isPoolDetailOnly = new RegExp(`^${escapedBase}/lending-pool/[^/]+$`).test(pathname)
  const isPoolNested = new RegExp(`^${escapedBase}/lending-pool/[^/]+/.+$`).test(pathname)

  const investorHowItWorks = base === '/dashboard/investor' && isPoolHowItWorks
  const investorPoolDetail = base === '/dashboard/investor' && isPoolDetailOnly
  const investorPoolAction = base === '/dashboard/investor' && isPoolNested && !isPoolHowItWorks
  const merchantPoolDetail = base === '/dashboard/merchant' && isPoolDetailOnly

  const navItems: NavItem[] = [
    {
      path: `${base}/overview`,
      icon: squaresFourIcon,
      isActive:
        pathname === base ||
        pathname === `${base}/` ||
        pathname.startsWith(`${base}/overview`) ||
        investorHowItWorks ||
        merchantPoolDetail,
    },
    {
      path: `${base}/opportunities`,
      icon: coinIcon,
      isActive: pathname.startsWith(`${base}/opportunities`) || investorPoolDetail || investorPoolAction,
    },
    {
      path: `${base}/profile/overview`,
      icon: userIcon,
      isActive: pathname.startsWith(`${base}/profile`) && !pathname.startsWith(`${base}/profile/wallets`),
    },
  ]

  const merchantExtraItems: NavItem[] =
    base === '/dashboard/merchant'
      ? [
          {
            path: `${base}/receivables`,
            icon: documentNavIcon,
            isActive: pathname.startsWith(`${base}/receivables`),
            iconSizeClass: 'w-[30px] h-[30px]',
          },
        ]
      : []

  const allNavItems = [...navItems.slice(0, 2), ...merchantExtraItems, ...navItems.slice(2)]

  return (
    <aside className="w-[72px] bg-[#F3F3F3] border-r border-[#E6E8EC] flex flex-col items-center justify-between py-2 h-dvh overflow-y-auto shadow-none">
      <div className="flex flex-col items-center gap-5 w-full">
        {onRequestClose ? (
          <div className="w-full flex justify-end px-2">
            <button
              type="button"
              onClick={onRequestClose}
              aria-label="Close navigation menu"
              className="h-[32px] w-[32px] rounded-[6px] flex items-center justify-center text-[#4D5D80] hover:bg-black/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        <Link to={`${base}/overview`} className="mt-1" aria-label="Dashboard home">
          <img src={logo} alt="logo" className="w-[45px] h-[40px]" />
        </Link>

        <div className="flex flex-col items-center gap-3 mt-6">
          {allNavItems.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-[40px] h-[40px] rounded-[6px] flex items-center justify-center ${
                item.isActive ? 'bg-[#E8EFFB]' : ''
              }`}
            >
              <img
                src={item.icon}
                alt={`dashboard nav icon ${idx + 1}`}
                className={`${item.iconSizeClass ?? 'w-[24px] h-[24px]'} ${item.isActive ? 'dashboard-nav-icon-active' : 'dashboard-nav-icon-inactive'}`}
              />
            </Link>
          ))}
        </div>
      </div>

      <button type="button" className="w-[32px] h-[32px] flex items-center justify-center">
        <img src={collapseArrowIcon} alt="collapse sidebar" className="w-[32px] h-[32px]" />
      </button>
    </aside>
  )
}

export default DashboardSideNav
