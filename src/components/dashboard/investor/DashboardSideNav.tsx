import logo from '@/assets/logo.png'
import squaresFourIcon from '@/assets/SquaresFour.svg'
import coinIcon from '@/assets/Coin.svg'
import userIcon from '@/assets/ph_user.svg'
import collapseArrowIcon from '@/assets/CollapseArrow.svg'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  icon: string
  isActive: boolean
}

const DashboardSideNav = () => {
  const location = useLocation()
  const pathname = location.pathname

  const navItems: NavItem[] = [
    {
      path: '/dashboard/investor/kyc',
      icon: squaresFourIcon,
      isActive: pathname === '/dashboard/investor' || pathname.startsWith('/dashboard/investor/kyc'),
    },
    {
      path: '/dashboard/investor/opportunities',
      icon: coinIcon,
      isActive: pathname.startsWith('/dashboard/investor/opportunities'),
    },
    {
      path: '/dashboard/investor/profile',
      icon: userIcon,
      isActive: pathname.startsWith('/dashboard/investor/profile'),
    },
  ]

  return (
    <aside className="w-[72px] bg-[#F3F3F3] border-r border-[#E6E8EC] flex flex-col items-center justify-between py-2">
      <div className="flex flex-col items-center gap-5 w-full">
        <img src={logo} alt="logo" className="w-[45px] h-[40px] mt-1" />

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
