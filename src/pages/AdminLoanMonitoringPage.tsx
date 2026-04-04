import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

function statusPill(status: LoanStatus) {
  switch (status) {
    case 'Active':
      return { bg: 'bg-[#E7F6EC]', text: 'text-[#16A34A]' }
    case 'Late':
      return { bg: 'bg-[#FBEAE9]', text: 'text-[#EF4444]' }
    case 'Under Review':
      return { bg: 'bg-[#F8EEFC]', text: 'text-[#A855F7]' }
    default:
      return { bg: 'bg-[#EEF0F4]', text: 'text-[#6B7488]' }
  }
}

const AdminLoanMonitoringPage = () => {
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
    <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY.map((c) => (
          <article key={c.title} className="rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 shadow-sm">
            <p className="text-[#0B1220] text-[14px] font-medium leading-tight">{c.title}</p>
            <p className="text-[#0B1220] text-[24px] font-semibold leading-tight mt-3">{c.value}</p>
          </article>
        ))}
      </section>

      <section className="flex items-center justify-between gap-4">
        <div className="w-full max-w-[320px] h-[44px] rounded-[6px] border border-[#E6E8EC] bg-white px-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7488" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by wallet or DNS..."
            className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[14px] placeholder:text-[#B0B7C4]"
            aria-label="Search loans"
          />
        </div>
      </section>

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px]">
            <thead>
              <tr className="bg-[#195EBC]">
                {['Receivable Name', 'Merchant', 'Amount', 'APR', 'Status', 'Next Payment', 'Action'].map((h) => (
                  <th key={h} className="text-left text-white text-[14px] font-medium px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredRows.map((r, idx) => {
                const pill = statusPill(r.status)
                const rowBg = idx % 2 === 1 ? 'bg-[#F3F7FC]' : 'bg-white'
                return (
                  <tr key={r.id} className={rowBg}>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivableName}</td>
                    <td className="px-5 py-5">
                      <div className="flex flex-col">
                        <span className="text-[#0B1220] text-[14px] font-medium">{r.merchantName}</span>
                        <span className="text-[#195EBC] text-[12px] mt-1 underline underline-offset-2">{r.merchantWallet}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-semibold">{r.amount}</td>
                    <td className="px-5 py-5 text-[#16A34A] text-[14px] font-medium">{r.apr}</td>
                    <td className="px-5 py-5">
                      <span className={['inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium', pill.bg, pill.text].join(' ')}>
                        {r.status}
                      </span>
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
                      <Link to={`/dashboard/admin/receivables/${r.receivableId}`} className="text-[#195EBC] text-[14px] underline underline-offset-2">
                        View Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminLoanMonitoringPage
