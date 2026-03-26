import type { InvestorProfileStat } from '@/components/dashboard/investor/profile/types'
import moneyIcon from '@/assets/Money.png'
import dollarIcon from '@/assets/CurrencyDollarSimple.png'

interface InvestorProfileStatsGridProps {
  stats: InvestorProfileStat[]
}

const valueClass = (tone?: InvestorProfileStat['tone']) => {
  if (tone === 'positive') return 'text-[#16A34A]'
  return 'text-[#0B1220]'
}

const statIcon = (icon: InvestorProfileStat['icon']) => {
  if (icon === 'dollar') return dollarIcon
  return moneyIcon
}

const InvestorProfileStatsGrid = ({ stats }: InvestorProfileStatsGridProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <article key={stat.title} className="rounded-[8px] border border-[#E6E8EC] bg-white px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-[5px] bg-[#195EBC] flex items-center justify-center">
              <img src={statIcon(stat.icon)} alt="" className="h-5 w-5 object-contain" />
            </div>
            <div>
              <p className="text-[#0B1220] text-[22px] font-medium leading-tight">{stat.title}</p>
              <p className="text-[#8B92A3] text-[12px] mt-1">{stat.subtitle}</p>
            </div>
          </div>
          <p className={`mt-4 text-[34px] font-semibold leading-tight ${valueClass(stat.tone)}`}>{stat.primaryValue}</p>
          {stat.secondaryValue ? <p className="text-[#8B92A3] text-[12px] mt-1">{stat.secondaryValue}</p> : null}
        </article>
      ))}
    </section>
  )
}

export default InvestorProfileStatsGrid
