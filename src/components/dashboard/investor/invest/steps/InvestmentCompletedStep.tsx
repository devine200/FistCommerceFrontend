import { Link } from 'react-router-dom'
import kycPendingIllustration from '@/assets/kyc-inprogress.png'
import type { InvestmentCompletedMetric } from '@/components/dashboard/investor/invest/types'

interface InvestmentCompletedStepProps {
  /** Formatted USD string (includes `$` and grouping). */
  amountDisplay: string
  poolName: string
  metrics: InvestmentCompletedMetric[]
  backToDashboardTo: string
  viewPoolDetailsTo: string
}

const InvestmentCompletedStep = ({
  amountDisplay,
  poolName,
  metrics,
  backToDashboardTo,
  viewPoolDetailsTo,
}: InvestmentCompletedStepProps) => {
  return (
    <>
      <section className="rounded-[8px] border border-[#E6E8EC] bg-white px-6 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center">
        <img src={kycPendingIllustration} alt="" className="h-20 w-20 object-contain" draggable={false} />
        <h2 className="mt-4 text-[#0B1220] font-bold text-[34px] leading-tight">Investment Successful</h2>
        <p className="mt-2 max-w-[560px] text-[#6B7488] text-[15px] leading-relaxed">
          Your {amountDisplay} USDC has been deployed to {poolName}. You&apos;ll start earning yield immediately.
        </p>

        <div className="mt-6 rounded-[6px] border border-[#E6E8EC] bg-white overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[#E6E8EC]">
            {metrics.map((metric) => (
              <div key={metric.label} className="px-5 py-3 min-w-[130px]">
                <p className="text-[#8B92A3] text-[12px]">{metric.label}</p>
                <p className="text-[#0B1220] text-[15px] font-semibold mt-1">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to={backToDashboardTo}
            className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            to={viewPoolDetailsTo}
            className="h-[46px] rounded-[4px] bg-[#EEF2F6] text-[#195EBC] text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#E5ECF4] transition-colors"
          >
            View Pool Details
          </Link>
        </div>
      </section>
    </>
  )
}

export default InvestmentCompletedStep
