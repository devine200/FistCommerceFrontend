import { NavLink } from 'react-router-dom'
import type { InvestorProfileTab } from '@/components/dashboard/investor/profile/types'

interface InvestorProfileTabsProps {
  tabs: InvestorProfileTab[]
}

const InvestorProfileTabs = ({ tabs }: InvestorProfileTabsProps) => {
  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-2">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={({ isActive }) =>
              `h-[48px] rounded-[6px] text-[16px] font-medium transition-colors flex items-center justify-center gap-2.5 ${
                isActive ? 'bg-[#195EBC] text-white' : 'bg-transparent text-[#7B8395]'
              }`
            }
          >
            {({ isActive }) => (
              <>
              <img
                src={tab.icon}
                alt=""
                className={`h-[18px] w-[18px] object-contain ${isActive ? 'brightness-0 invert' : 'opacity-70'}`}
              />
              {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </section>
  )
}

export default InvestorProfileTabs
