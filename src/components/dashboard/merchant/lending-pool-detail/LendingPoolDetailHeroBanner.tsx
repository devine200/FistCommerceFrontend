import {
  POOL_DETAIL_SUBTITLE,
  POOL_DETAIL_TITLE,
  POOL_METRIC_HINT,
  POOL_METRIC_LABEL,
  POOL_METRIC_VALUE,
} from '@/components/dashboard/shared/poolDetailTypography'

type StatItem = {
  label: string
  value: string
  hint?: string
}

interface LendingPoolDetailHeroBannerProps {
  title: string
  subtitle: string
  stats: StatItem[]
  onApplyToBorrow?: () => void
}

const CodeBadgeIcon = () => (
  <div
    className="h-[52px] w-[52px] shrink-0 rounded-full bg-white flex items-center justify-center text-[#0B1220] font-mono font-bold text-[15px] leading-none"
    aria-hidden
  >
    &lt;/&gt;
  </div>
)

const LendingPoolDetailHeroBanner = ({ title, subtitle, stats, onApplyToBorrow }: LendingPoolDetailHeroBannerProps) => {
  return (
    <section className="rounded-[12px] bg-white border border-[#E6E8EC] px-4 py-5 sm:px-6 sm:py-6 lg:bg-[#EBEEF3] lg:border-0 lg:px-8 lg:py-7">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <CodeBadgeIcon />
            <div className="min-w-0 pt-0.5">
              <h1 className={POOL_DETAIL_TITLE}>{title}</h1>
              <p className={POOL_DETAIL_SUBTITLE}>{subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5 pt-2 lg:pt-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 min-w-0">
                <span className={POOL_METRIC_LABEL}>{s.label}</span>
                <span className={POOL_METRIC_VALUE}>{s.value}</span>
                {s.hint ? <span className={POOL_METRIC_HINT}>{s.hint}</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end shrink-0 lg:self-stretch lg:items-center">
          <button
            type="button"
            onClick={onApplyToBorrow}
            className="bg-[#195EBC] text-white font-semibold text-[14px] sm:text-[15px] lg:text-[16px] px-10 py-3.5 lg:py-4 rounded-[8px] w-full max-w-none sm:max-w-[260px] lg:w-[180px] text-center leading-snug shadow-sm hover:bg-[#154a9a] transition-colors"
          >
            Apply To Borrow
          </button>
        </div>
      </div>
    </section>
  )
}

export default LendingPoolDetailHeroBanner
