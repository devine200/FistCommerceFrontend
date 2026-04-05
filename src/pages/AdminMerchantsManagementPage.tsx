import { useMemo, useState } from 'react'

import {
  AdminPageFrame,
  AdminPanel,
  AdminPartyStack,
  AdminSearchField,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusPill,
  AdminTableHeadRow,
  AdminTableShell,
  AdminTableTextLink,
  adminZebraRowClass,
  type AdminPillVariant,
} from '@/components/admin/primitives'
import type { MerchantTableRow } from '@/components/admin/merchants/merchantsMockData'
import { useAppSelector } from '@/store/hooks'

const SUMMARY = [
  { title: 'Total Merchants', value: '2' },
  { title: 'Active Merchants', value: '34' },
  { title: 'Under Review', value: '1,543' },
  { title: 'Suspended Merchants', value: '126' },
] as const

function merchantPillVariant(status: MerchantTableRow['status']): AdminPillVariant {
  switch (status) {
    case 'Approved':
      return 'approved'
    case 'Rejected':
      return 'rejected'
    case 'Under Review':
      return 'underReview'
    case 'Pending':
      return 'pending'
    default:
      return 'neutral'
  }
}

const TABLE_HEADERS = ['Merchant', 'Industry', 'Total Loans', 'Current Debt Owed', 'Status', 'No. of Receivables', 'Action'] as const

const AdminMerchantsManagementPage = () => {
  const tableRows = useAppSelector((s) => s.adminMerchants.tableRows)
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tableRows
    return tableRows.filter((r) => {
      return (
        r.merchantName.toLowerCase().includes(q) ||
        r.merchantWallet.toLowerCase().includes(q) ||
        r.industry.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      )
    })
  }, [query, tableRows])

  return (
    <AdminPageFrame>
      <AdminStatGrid>
        {SUMMARY.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} />
        ))}
      </AdminStatGrid>

      <section className="flex items-center justify-between gap-4">
        <AdminSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search for a merchant."
          aria-label="Search for a merchant"
          className="max-w-[280px]"
        />
      </section>

      <AdminPanel>
        <AdminTableShell minWidthClassName="min-w-[1060px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {filteredRows.map((r, idx) => (
              <tr key={r.id} className={adminZebraRowClass(idx)}>
                <td className="px-5 py-5">
                  <AdminPartyStack primary={r.merchantName} secondary={r.merchantWallet} />
                </td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.industry}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.totalLoans}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.currentDebtOwed}</td>
                <td className="px-5 py-5">
                  <AdminStatusPill variant={merchantPillVariant(r.status)}>{r.status}</AdminStatusPill>
                </td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivablesCountLabel}</td>
                <td className="px-5 py-5">
                  <AdminTableTextLink to={`/dashboard/admin/merchants/${r.id}`}>View Details</AdminTableTextLink>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminMerchantsManagementPage
