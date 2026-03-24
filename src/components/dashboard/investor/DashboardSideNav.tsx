import logo from '@/assets/logo.png'
import squaresFourIcon from '@/assets/SquaresFour.svg'
import coinIcon from '@/assets/Coin.svg'
import userIcon from '@/assets/ph_user.svg'
import collapseArrowIcon from '@/assets/CollapseArrow.svg'
import type { DashboardBasePath } from '@/layouts/DashboardLayout'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  icon: string
  isActive: boolean
}

function resolveDashboardBase(pathname: string, explicit?: DashboardBasePath): DashboardBasePath {
  if (explicit) return explicit
  if (pathname.startsWith('/dashboard/merchant')) return '/dashboard/merchant'
  return '/dashboard/investor'
}

interface DashboardSideNavProps {
  basePath?: DashboardBasePath
}

const DashboardSideNav = ({ basePath: basePathProp }: DashboardSideNavProps) => {
  const location = useLocation()
  const pathname = location.pathname

  const base = resolveDashboardBase(pathname, basePathProp)

  const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const isPoolHowItWorks = new RegExp(`^${escapedBase}/lending-pool/[^/]+/how-it-works$`).test(pathname)
  const isPoolDetailOnly = new RegExp(`^${escapedBase}/lending-pool/[^/]+$`).test(pathname)

  const investorHowItWorks = base === '/dashboard/investor' && isPoolHowItWorks
  const investorPoolDetail = base === '/dashboard/investor' && isPoolDetailOnly
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
      isActive: pathname.startsWith(`${base}/opportunities`) || investorPoolDetail,
    },
    {
      path: `${base}/profile`,
      icon: userIcon,
      isActive: pathname.startsWith(`${base}/profile`),
    },
  ]

  return (
    <aside className="w-[72px] bg-[#F3F3F3] border-r border-[#E6E8EC] flex flex-col items-center justify-between py-2">
      <div className="flex flex-col items-center gap-5 w-full">
        <Link to={`${base}/overview`} className="mt-1" aria-label="Dashboard home">
          <img src={logo} alt="logo" className="w-[45px] h-[40px]" />
        </Link>

        <div className="flex flex-col items-center gap-3 mt-6">
          {navItems.map((item, idx) => (
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
                className={`w-[24px] h-[24px] ${item.isActive ? 'dashboard-nav-icon-active' : 'dashboard-nav-icon-inactive'}`}
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
