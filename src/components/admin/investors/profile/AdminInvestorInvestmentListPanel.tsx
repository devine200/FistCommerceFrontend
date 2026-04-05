import { Link } from 'react-router-dom'

import { AdminPanel, AdminSearchField } from '@/components/admin/primitives'

import { InvestIcon, ListRowChevron } from './InvestorProfileListIcons'
import type { AdminInvestorInvestmentListPanelProps } from './types'

const investmentDetailPath = (investorId: string, recordId: string) =>
  `/dashboard/admin/investors/${investorId}/activity/${recordId}`

export function AdminInvestorInvestmentListPanel({
  investorId,
  title,
  items,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search for a receivable',
  searchAriaLabel,
}: AdminInvestorInvestmentListPanelProps) {
  return (
    <AdminPanel>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-[#E6E8EC]">
        <h2 className="text-[#0B1220] font-semibold text-[16px]">
          {title} ({items.length})
        </h2>
        <AdminSearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel ?? `Search ${title.toLowerCase()}`}
          className="max-w-[280px] w-full sm:w-auto"
        />
      </div>
      <ul className="divide-y divide-[#E6E8EC]">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={investmentDetailPath(investorId, item.id)}
              aria-label={`Investment details: ${item.title}`}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
            >
              <InvestIcon square />
              <div className="flex-1 min-w-0">
                <p className="text-[#0B1220] text-[14px] font-medium">{item.title}</p>
                <p className="text-[#6B7488] text-[13px] mt-0.5">{item.dateLabel}</p>
              </div>
              <span className="text-[#0B1220] text-[14px] font-semibold tabular-nums shrink-0">{item.amount}</span>
              <ListRowChevron />
            </Link>
          </li>
        ))}
      </ul>
    </AdminPanel>
  )
}
