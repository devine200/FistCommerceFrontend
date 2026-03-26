import type { InvestorPortfolioMetric } from '@/components/dashboard/investor/profile/types'

interface InvestorPortfolioSummaryCardProps {
  title: string
  poolName: string
  poolMeta: string
  metrics: InvestorPortfolioMetric[]
}

const InvestorPortfolioSummaryCard = ({
  title,
  poolName,
  poolMeta,
  metrics,
}: InvestorPortfolioSummaryCardProps) => {
  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white px-5 py-6">
      <h2 className="text-[#4D5D80] text-[28px] font-semibold leading-tight">{title}</h2>
      <p className="mt-4 text-[#0B1220] text-[26px] font-semibold leading-tight">{poolName}</p>
      <p className="text-[#8B92A3] text-[13px] mt-1">{poolMeta}</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[#8B92A3] text-[12px]">{metric.label}</p>
            <p className="text-[#0B1220] text-[31px] font-semibold leading-tight mt-1">{metric.value}</p>
            {metric.helper ? <p className="text-[#8B92A3] text-[12px] mt-1">{metric.helper}</p> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default InvestorPortfolioSummaryCard
