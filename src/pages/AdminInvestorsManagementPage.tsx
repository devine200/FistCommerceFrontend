import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
import type { KycStatus } from '@/components/admin/investors/investorsMockData'
import { useAppSelector } from '@/store/hooks'

const SUMMARY = [
  { title: 'Total Investors', value: '121' },
  { title: 'Total Invested', value: '$' },
  { title: 'Total Earnings Paid', value: '$4,900' },
  { title: 'Frozen Accounts', value: '126' },
] as const

function kycPillVariant(status: KycStatus): AdminPillVariant {
  switch (status) {
    case 'Approved':
      return 'approved'
    case 'Rejected':
      return 'rejected'
    case 'Under Review':
      return 'underReview'
    default:
      return 'neutral'
  }
}

const TABLE_HEADERS = ['Investor', 'Invested', 'Earnings', 'Amount Withdrawn', 'KYC Status', 'No. of Receivables', 'Action'] as const

const AdminInvestorsManagementPage = () => {
  const navigate = useNavigate()
  const tableRows = useAppSelector((s) => s.adminInvestors.tableRows)
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tableRows
    return tableRows.filter((r) => {
      return (
        r.investorName.toLowerCase().includes(q) ||
        r.investorWallet.toLowerCase().includes(q) ||
        r.kycStatus.toLowerCase().includes(q)
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
          placeholder="Search by wallet or DNS..."
          aria-label="Search investors"
          className="max-w-[320px]"
        />
      </section>

      <AdminPanel>
        <AdminTableShell minWidthClassName="min-w-[1120px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {filteredRows.map((r, idx) => (
              <tr
                key={r.id}
                className={[adminZebraRowClass(idx), 'cursor-pointer hover:bg-[#F3F7FC]/80 transition-colors'].join(' ')}
                tabIndex={0}
                role="link"
                aria-label={`Open profile for ${r.investorName}`}
                onClick={() => navigate(`/dashboard/admin/investors/${r.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/dashboard/admin/investors/${r.id}`)
                  }
                }}
              >
                <td className="px-5 py-5">
                  <AdminPartyStack primary={r.investorName} secondary={r.investorWallet} />
                </td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.invested}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.earnings}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.amountWithdrawn}</td>
                <td className="px-5 py-5">
                  <AdminStatusPill variant={kycPillVariant(r.kycStatus)}>{r.kycStatus}</AdminStatusPill>
                </td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivablesCountLabel}</td>
                <td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
                  <AdminTableTextLink
                    to={`/dashboard/admin/investors/${r.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View profile
                  </AdminTableTextLink>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminInvestorsManagementPage
