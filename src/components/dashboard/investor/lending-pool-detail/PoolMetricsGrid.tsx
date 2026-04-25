import type { PoolStatItem } from '@/components/dashboard/investor/lending-pool-detail/types'
import { POOL_METRIC_HINT, POOL_METRIC_LABEL, POOL_METRIC_VALUE } from '@/components/dashboard/shared/poolDetailTypography'

interface PoolMetricsGridProps {
  stats: PoolStatItem[]
}

/** Reusable 5-column (responsive) metrics row using shared pool detail typography */
const PoolMetricsGrid = ({ stats }: PoolMetricsGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1 min-w-0">
          <span className={POOL_METRIC_LABEL}>{s.label}</span>
          <span className={POOL_METRIC_VALUE}>{s.value}</span>
          {s.hint ? <span className={POOL_METRIC_HINT}>{s.hint}</span> : null}
        </div>
      ))}
    </div>
  )
}

export default PoolMetricsGrid
