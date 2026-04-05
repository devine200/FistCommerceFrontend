import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  AdminPageFrame,
  AdminPanel,
  AdminPartyStack,
  AdminSearchField,
  AdminSegmentedTabs,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusPill,
  AdminTableHeadRow,
  AdminTableShell,
  AdminTableTextLink,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminPillVariant,
  type AdminTabItem,
} from '@/components/admin/primitives'
import { useAdminReceivableDetailHref } from '@/components/admin/useAdminReceivableDetailHref'

type ReceivableStatus = 'Approved' | 'Rejected' | 'Under Review'

type ReceivableRow = {
  id: string
  merchantName: string
  merchantWallet: string
  receivable: string
  loanAmount: string
  period: string
  status: ReceivableStatus
}

const SUMMARY = [
  { title: 'Pending Review', value: '2' },
  { title: 'Under Review', value: '34' },
  { title: 'Approved', value: '1,543' },
  { title: 'Rejected', value: '126' },
] as const

const TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const
type TabKey = (typeof TABS)[number]

const TAB_ITEMS: AdminTabItem<TabKey>[] = TABS.map((t) => ({ value: t, label: t }))

const ROWS: ReceivableRow[] = [
  {
    id: 'r-1',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    receivable: 'Slippers Bulk Order',
    loanAmount: '$23,000',
    period: '30 Days',
    status: 'Approved',
  },
  {
    id: 'r-2',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    receivable: 'SaaS Subscription',
    loanAmount: '$23,000',
    period: '60 Days',
    status: 'Rejected',
  },
  {
    id: 'r-3',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    receivable: 'Gold Bulk Order',
    loanAmount: '$23,000',
    period: '90 Days',
    status: 'Approved',
  },
  {
    id: 'r-4',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    receivable: 'Shipping Order',
    loanAmount: '$23,000',
    period: '60 Days',
    status: 'Under Review',
  },
  {
    id: 'r-5',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    receivable: 'Gold Bulk Order',
    loanAmount: '$23,000',
    period: '90 Days',
    status: 'Approved',
  },
]

function receivablePillVariant(status: ReceivableStatus): AdminPillVariant {
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

const TABLE_HEADERS = ['Merchant', 'Receivable', 'Loan Amount', 'Period', 'Documents', 'Status', 'Action'] as const

const AdminReceivablesManagementPage = () => {
  const receivableDetailHref = useAdminReceivableDetailHref()
  const [tab, setTab] = useState<TabKey>('All')
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROWS.filter((r) => {
      const matchesTab =
        tab === 'All' ? true : tab === 'Pending' ? false : r.status === tab

      const matchesQuery =
        !q ||
        r.merchantName.toLowerCase().includes(q) ||
        r.merchantWallet.toLowerCase().includes(q) ||
        r.receivable.toLowerCase().includes(q)

      return matchesTab && matchesQuery
    })
  }, [query, tab])

  return (
    <AdminPageFrame>
      <AdminStatGrid>
        {SUMMARY.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} />
        ))}
      </AdminStatGrid>

      <AdminPanel>
        <AdminToolbarRow
          start={<AdminSegmentedTabs items={TAB_ITEMS} value={tab} onChange={setTab} />}
          end={
            <AdminSearchField
              value={query}
              onChange={setQuery}
              placeholder="Search for a receivable"
              aria-label="Search for a receivable"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[980px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {filteredRows.map((r, idx) => (
              <tr key={`${r.merchantWallet}-${r.receivable}-${idx}`} className={adminZebraRowClass(idx)}>
                <td className="px-5 py-5">
                  <AdminPartyStack primary={r.merchantName} secondary={r.merchantWallet} />
                </td>
                <td className="px-5 py-5">
                  <Link
                    to={receivableDetailHref(r.id)}
                    className="text-[#0B1220] text-[14px] font-medium hover:underline underline-offset-2"
                  >
                    {r.receivable}
                  </Link>
                </td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.loanAmount}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.period}</td>
                <td className="px-5 py-5">
                  <button type="button" className="text-[#195EBC] text-[14px] underline underline-offset-2">
                    View Documents
                  </button>
                </td>
                <td className="px-5 py-5">
                  <AdminStatusPill variant={receivablePillVariant(r.status)}>{r.status}</AdminStatusPill>
                </td>
                <td className="px-5 py-5">
                  <AdminTableTextLink to={receivableDetailHref(r.id)}>
                    View Details
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

export default AdminReceivablesManagementPage
