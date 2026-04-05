import AdminPanel from '@/components/admin/primitives/AdminPanel'

import type { InvestmentActivityDetail } from '@/components/admin/investors/investorsMockData'

const rowClass =
  'flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-3.5 border-b border-[#EDF0F4] last:border-b-0'
const labelClass = 'text-[#6B7488] text-[14px]'
const valueClass = 'text-[#0B1220] text-[14px] font-medium tabular-nums text-right sm:text-left'

export function AdminInvestmentDetailView({ detail }: { detail: InvestmentActivityDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[#0B1220] font-bold text-[22px] sm:text-[26px] leading-tight">Investment Details</h1>
        <p className="text-[#6B7488] text-[14px]">View a complete breakdown of this investment.</p>
      </header>

      <AdminPanel>
        <div className="px-5 py-5 flex flex-col gap-4">
          <h2 className="text-[#0B1220] font-semibold text-[16px]">{detail.maturityHeadline}</h2>
          <div className="h-2.5 w-full rounded-full bg-[#E8EDF4] overflow-hidden" role="progressbar" aria-valuenow={detail.progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full bg-[#195EBC] transition-[width] duration-300"
              style={{ width: `${detail.progressPercent}%` }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[#6B7488] text-[13px]">{detail.progressRangeLabel}</p>
            <p className="text-[#0B1220] text-[14px] font-semibold tabular-nums">{detail.progressPercent}%</p>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="px-5 py-2">
          <div className={rowClass}>
            <span className={labelClass}>Investor Name</span>
            <span className={valueClass}>{detail.investorName}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Amount Invested</span>
            <span className={valueClass}>{detail.amountInvested}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Expected Returns</span>
            <span className={valueClass}>{detail.expectedReturns}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Total payout (principal + return)</span>
            <span className={valueClass}>{detail.totalPayout}</span>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="px-5 py-2">
          <div className={rowClass}>
            <span className={labelClass}>Investment Date</span>
            <span className={valueClass}>{detail.investmentDateLabel}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Maturity Date</span>
            <span className={valueClass}>{detail.maturityDateLabel}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Status</span>
            <span className="text-[#195EBC] text-[14px] font-bold sm:text-right tabular-nums">
              {detail.statusLabel}
            </span>
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
