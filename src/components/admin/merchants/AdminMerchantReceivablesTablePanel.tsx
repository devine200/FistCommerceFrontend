import { Link } from 'react-router-dom'

import {
  AdminPanel,
  AdminSearchField,
  AdminStatusPill,
  AdminTableHeadRow,
  AdminTableShell,
  adminZebraRowClass,
} from '@/components/admin/primitives'
import { useAdminReceivableDetailHref } from '@/components/admin/useAdminReceivableDetailHref'
import { ListRowChevron } from '@/components/admin/investors/profile/InvestorProfileListIcons'
import type { ReceivableTableRow, RepaymentDueVariant } from '@/components/dashboard/merchant/receivables/types'

const HEADERS = [
  'Receivable Name',
  'Loan Amount',
  'APR',
  'Repayment Due',
  'Repayment Amount',
  'Debt Status',
  'Action',
] as const

function repaymentDueClass(variant: RepaymentDueVariant): string {
  if (variant === 'upcoming') return 'text-[#EA580C] font-semibold'
  if (variant === 'overdue') return 'text-[#DC2626] font-semibold'
  return 'text-[#16A34A] font-semibold'
}

function DebtStatusCell({ row }: { row: ReceivableTableRow }) {
  if (row.debtStatusVariant === 'defaulted' || row.debtStatusVariant === 'repaid') {
    return <span className="text-[#195EBC] text-[14px] font-semibold">{row.debtStatus}</span>
  }
  return <AdminStatusPill variant="neutral">{row.debtStatus}</AdminStatusPill>
}

export type AdminMerchantReceivablesTablePanelProps = {
  title: string
  items: ReceivableTableRow[]
  /** When set, shown in the title instead of `items.length` (e.g. total catalog size). */
  titleCountOverride?: number
  searchValue: string
  onSearchChange: (value: string) => void
  searchAriaLabel?: string
}

export function AdminMerchantReceivablesTablePanel({
  title,
  items,
  titleCountOverride,
  searchValue,
  onSearchChange,
  searchAriaLabel,
}: AdminMerchantReceivablesTablePanelProps) {
  const receivableDetailHref = useAdminReceivableDetailHref()
  const count = titleCountOverride ?? items.length
  return (
    <AdminPanel>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-[#E6E8EC]">
        <h2 className="text-[#0B1220] font-semibold text-[16px]">
          {title} ({count})
        </h2>
        <AdminSearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search for a receivable"
          aria-label={searchAriaLabel ?? `Search ${title.toLowerCase()}`}
          className="max-w-[280px] w-full sm:w-auto"
        />
      </div>
      <AdminTableShell minWidthClassName="min-w-[1100px]">
        <AdminTableHeadRow labels={HEADERS} />
        <tbody className="bg-white">
          {items.length === 0 ? (
            <tr>
              <td colSpan={HEADERS.length} className="px-5 py-12 text-center text-[#6B7488] text-[14px]">
                No receivables in this list.
              </td>
            </tr>
          ) : (
            items.map((row, idx) => (
              <tr key={row.id} className={adminZebraRowClass(idx)}>
                <td className="px-5 py-4 text-[#0B1220] text-[14px] font-medium">{row.receivableName}</td>
                <td className="px-5 py-4 text-[#0B1220] text-[14px] font-medium tabular-nums">{row.loanAmount}</td>
                <td className="px-5 py-4 text-[#0B1220] text-[14px] font-medium">{row.apr}</td>
                <td className="px-5 py-4">
                  <span className={`text-[14px] ${repaymentDueClass(row.repaymentDueVariant)}`}>{row.repaymentDue}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-[#0B1220] text-[14px] font-semibold tabular-nums">{row.repaymentAmount}</div>
                  {row.interestSubline ? (
                    <div className="text-[#6B7488] text-[12px] mt-0.5">{row.interestSubline}</div>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <DebtStatusCell row={row} />
                </td>
                <td className="px-5 py-4">
                  <Link
                    to={receivableDetailHref(row.id)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-[6px] text-[#195EBC] hover:bg-[#E8EFFB] transition-colors"
                    aria-label={`View receivable ${row.receivableName}`}
                  >
                    <ListRowChevron />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTableShell>
    </AdminPanel>
  )
}
