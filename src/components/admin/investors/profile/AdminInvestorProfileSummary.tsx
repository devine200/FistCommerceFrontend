import { AdminPanel } from '@/components/admin/primitives'

import type { AdminInvestorProfileSummaryProps, StatPair } from './types'

const statLabel = 'text-[12px] sm:text-[13px] font-medium text-[#7A8BA1] mb-1'
const statValue = 'text-[#0B1220] text-[15px] sm:text-[16px] font-semibold'

function StatCell({ pair }: { pair: StatPair }) {
  return (
    <div className="min-w-0 text-left">
      <p className={statLabel}>{pair.label}</p>
      <p className={statValue}>{pair.value}</p>
    </div>
  )
}

export function AdminInvestorProfileSummary({
  avatarSrc,
  avatarAlt = '',
  displayName,
  walletLabel,
  statColumns,
}: AdminInvestorProfileSummaryProps) {
  return (
    <AdminPanel className="p-0">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex flex-col items-center justify-center text-center px-6 py-8 sm:py-10 lg:px-8 lg:py-10 lg:border-r lg:border-[#E6E8EC] lg:shrink-0 lg:w-[min(100%,280px)]">
          <img
            src={avatarSrc}
            alt={avatarAlt}
            width={88}
            height={88}
            className="h-[88px] w-[88px] rounded-full object-cover shrink-0 ring-1 ring-black/5"
          />
          <h1 className="mt-4 text-[#0B1220] font-bold text-[18px] sm:text-[20px] leading-tight">{displayName}</h1>
          <p className="mt-1.5 text-[13px] font-mono text-[#195EBC] truncate max-w-[220px] sm:max-w-[240px]" title={walletLabel}>
            {walletLabel}
          </p>
        </div>

        <div className="flex-1 min-w-0 px-6 py-8 sm:py-10 lg:px-10 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:gap-x-8 lg:gap-x-12 gap-y-8">
            {statColumns.map((column, colIndex) => (
              <div key={colIndex} className="flex-1 min-w-0 space-y-5">
                {column.map((cell, rowIndex) =>
                  cell ? (
                    <StatCell key={cell.label} pair={cell} />
                  ) : (
                    <div key={`empty-${colIndex}-${rowIndex}`} className="hidden sm:block min-h-[52px]" aria-hidden />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPanel>
  )
}
