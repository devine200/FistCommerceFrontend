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
import { useAdminReceivableDetailHref } from '@/components/admin/useAdminReceivableDetailHref'

type LoanStatus = 'Active' | 'Late' | 'Under Review'

type LoanRow = {
  id: string
  receivableId: string
  receivableName: string
  merchantName: string
  merchantWallet: string
  amount: string
  apr: string
  status: LoanStatus
  nextPayment: string
  nextPaymentIsOverdue: boolean
}

const SUMMARY = [
  { title: 'Active Loans', value: '121' },
  { title: 'Late Payments', value: '$' },
  { title: 'Defaulted Loans', value: '$4,900' },
  { title: 'Fully Repaid', value: '126' },
] as const

const ROWS: LoanRow[] = [
  {
    id: 'lm-1',
    receivableId: 'r-1',
    receivableName: 'Slippers Bulk Order',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7tyfghn4j3kio9eud...',
    amount: '$24,000',
    apr: '4.3%',
    status: 'Active',
    nextPayment: '18th May, 2026.',
    nextPaymentIsOverdue: false,
  },
  {
    id: 'lm-2',
    receivableId: 'r-2',
    receivableName: 'Slippers Bulk Order',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7tyfghn4j3kio9eud...',
    amount: '$24,000',
    apr: '4.3%',
    status: 'Late',
    nextPayment: '-11 Days',
    nextPaymentIsOverdue: true,
  },
  {
    id: 'lm-3',
    receivableId: 'r-3',
    receivableName: 'Slippers Bulk Order',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7tyfghn4j3kio9eud...',
    amount: '$24,000',
    apr: '4.3%',
    status: 'Under Review',
    nextPayment: '18th May, 2026.',
    nextPaymentIsOverdue: false,
  },
  {
    id: 'lm-4',
    receivableId: 'r-4',
    receivableName: 'Slippers Bulk Order',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7tyfghn4j3kio9eud...',
    amount: '$24,000',
    apr: '4.3%',
    status: 'Late',
    nextPayment: '-21 Days',
    nextPaymentIsOverdue: true,
  },
  {
    id: 'lm-5',
    receivableId: 'r-5',
    receivableName: 'Slippers Bulk Order',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7tyfghn4j3kio9eud...',
    amount: '$24,000',
    apr: '4.3%',
    status: 'Active',
    nextPayment: '18th May, 2026.',
    nextPaymentIsOverdue: false,
  },
  {
    id: 'lm-6',
    receivableId: 'r-6',
    receivableName: 'Slippers Bulk Order',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7tyfghn4j3kio9eud...',
    amount: '$24,000',
    apr: '4.3%',
    status: 'Under Review',
    nextPayment: '18th May, 2026.',
    nextPaymentIsOverdue: false,
  },
]

function loanPillVariant(status: LoanStatus): AdminPillVariant {
  switch (status) {
    case 'Active':
      return 'active'
    case 'Late':
      return 'late'
    case 'Under Review':
      return 'underReview'
    default:
      return 'neutral'
  }
}

const TABLE_HEADERS = ['Receivable Name', 'Merchant', 'Amount', 'APR', 'Status', 'Next Payment', 'Action'] as const

const AdminLoanMonitoringPage = () => {
  const receivableDetailHref = useAdminReceivableDetailHref()
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter((r) => {
      return (
        r.receivableName.toLowerCase().includes(q) ||
        r.merchantName.toLowerCase().includes(q) ||
        r.merchantWallet.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      )
    })
  }, [query])

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
          aria-label="Search loans"
          className="max-w-[320px]"
        />
      </section>

      <AdminPanel>
        <AdminTableShell minWidthClassName="min-w-[1060px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {filteredRows.map((r, idx) => (
              <tr key={r.id} className={adminZebraRowClass(idx)}>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivableName}</td>
                <td className="px-5 py-5">
                  <AdminPartyStack primary={r.merchantName} secondary={r.merchantWallet} secondaryUnderline />
                </td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-semibold">{r.amount}</td>
                <td className="px-5 py-5 text-[#16A34A] text-[14px] font-medium">{r.apr}</td>
                <td className="px-5 py-5">
                  <AdminStatusPill variant={loanPillVariant(r.status)}>{r.status}</AdminStatusPill>
                </td>
                <td className="px-5 py-5">
                  <span
                    className={[
                      'text-[14px] font-medium',
                      r.nextPaymentIsOverdue ? 'text-[#EF4444]' : 'text-[#0B1220]',
                    ].join(' ')}
                  >
                    {r.nextPayment}
                  </span>
                </td>
                <td className="px-5 py-5">
                  <AdminTableTextLink to={receivableDetailHref(r.receivableId)}>
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

export default AdminLoanMonitoringPage
