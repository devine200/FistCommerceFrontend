import { Link } from 'react-router-dom'

import { AdminPanel, AdminSearchField, AdminSegmentedTabs } from '@/components/admin/primitives'

import { ActivityKindIcon, activityAmountClassName } from './InvestorProfileListIcons'
import type { AdminInvestorActivityPanelProps } from './types'

const activityDetailPath = (investorId: string, activityId: string) =>
  `/dashboard/admin/investors/${investorId}/activity/${activityId}`

export function AdminInvestorActivityPanel({
  investorId,
  items,
  searchValue,
  onSearchChange,
  activityFilter,
  onActivityFilterChange,
  filterTabs,
  searchPlaceholder = 'Search activity',
  searchAriaLabel = 'Search activity',
}: AdminInvestorActivityPanelProps) {
  return (
    <AdminPanel>
      <div className="flex flex-col gap-4 px-5 py-4 border-b border-[#E6E8EC]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[#0B1220] font-semibold text-[16px]">Activity ({items.length})</h2>
          <AdminSearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            className="max-w-[280px] w-full sm:w-auto"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminSegmentedTabs items={filterTabs} value={activityFilter} onChange={onActivityFilterChange} variant="alerts" />
        </div>
      </div>
      <ul className="divide-y divide-[#E6E8EC]">
        {items.map((item) => {
          const rowInner = (
            <>
              <ActivityKindIcon kind={item.kind} />
              <div className="flex-1 min-w-0">
                <p className="text-[#0B1220] text-[14px] font-medium">{item.title}</p>
                <p className="text-[#6B7488] text-[13px] mt-0.5">{item.dateLabel}</p>
              </div>
              <span className={`text-[14px] tabular-nums shrink-0 ${activityAmountClassName(item.kind)}`}>
                {item.amountDisplay}
              </span>
            </>
          )

          return (
            <li key={item.id}>
              <Link
                to={activityDetailPath(investorId, item.id)}
                aria-label={`Investment details: ${item.title}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left w-full"
              >
                {rowInner}
              </Link>
            </li>
          )
        })}
      </ul>
    </AdminPanel>
  )
}
