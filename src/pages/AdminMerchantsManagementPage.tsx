import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type MerchantStatus = 'Pending' | 'Rejected' | 'Approved' | 'Under Review'

type MerchantRow = {
  id: string
  receivableId: string
  merchantName: string
  merchantWallet: string
  industry: string
  totalLoans: string
  currentDebtOwed: string
  status: MerchantStatus
  receivablesCountLabel: string
}

const SUMMARY = [
  { title: 'Total Merchants', value: '2' },
  { title: 'Active Merchants', value: '34' },
  { title: 'Under Review', value: '1,543' },
  { title: 'Suspended Merchants', value: '126' },
] as const

const ROWS: MerchantRow[] = [
  {
    id: 'm-1',
    receivableId: 'r-1',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'SaaS',
    totalLoans: '$323,000',
    currentDebtOwed: '-$23,000',
    status: 'Pending',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'm-2',
    receivableId: 'r-2',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Cloud Infra',
    totalLoans: '$420,000',
    currentDebtOwed: '-$63,000',
    status: 'Rejected',
    receivablesCountLabel: '7 Receivables',
  },
  {
    id: 'm-3',
    receivableId: 'r-3',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Manufacturing',
    totalLoans: '$103,500',
    currentDebtOwed: '$0',
    status: 'Approved',
    receivablesCountLabel: '3 Receivables',
  },
  {
    id: 'm-4',
    receivableId: 'r-4',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Data Storage',
    totalLoans: '$23,000',
    currentDebtOwed: '-$23,000',
    status: 'Under Review',
    receivablesCountLabel: '1 Receivables',
  },
  {
    id: 'm-5',
    receivableId: 'r-5',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Trade',
    totalLoans: '$400,000',
    currentDebtOwed: '$0',
    status: 'Approved',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'm-6',
    receivableId: 'r-6',
    merchantName: 'Ajala Harris',
    merchantWallet: '48r7yfghn4j3kio9eud...',
    industry: 'Consulting',
    totalLoans: '$150,000',
    currentDebtOwed: '$0',
    status: 'Under Review',
    receivablesCountLabel: '11 Receivables',
  },
]

function statusPill(status: MerchantStatus) {
  switch (status) {
    case 'Approved':
      return { bg: 'bg-[#E7F6EC]', text: 'text-[#16A34A]' }
    case 'Rejected':
      return { bg: 'bg-[#FBEAE9]', text: 'text-[#EF4444]' }
    case 'Under Review':
      return { bg: 'bg-[#F8EEFC]', text: 'text-[#A855F7]' }
    case 'Pending':
      return { bg: 'bg-[#FFF0E5]', text: 'text-[#EA580C]' }
    default:
      return { bg: 'bg-[#EEF0F4]', text: 'text-[#6B7488]' }
  }
}

const AdminMerchantsManagementPage = () => {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter((r) => {
      return (
        r.merchantName.toLowerCase().includes(q) ||
        r.merchantWallet.toLowerCase().includes(q) ||
        r.industry.toLowerCase().includes(q) ||
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
        <div className="w-full max-w-[280px] h-[44px] rounded-[6px] border border-[#E6E8EC] bg-white px-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7488" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a merchant."
            className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[14px] placeholder:text-[#B0B7C4]"
            aria-label="Search for a merchant"
          />
        </div>
      </section>

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px]">
            <thead>
              <tr className="bg-[#195EBC]">
                {['Merchant', 'Industry', 'Total Loans', 'Current Debt Owed', 'Status', 'No. of Receivables', 'Action'].map((h) => (
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
                    <td className="px-5 py-5">
                      <div className="flex flex-col">
                        <span className="text-[#0B1220] text-[14px] font-medium">{r.merchantName}</span>
                        <span className="text-[#195EBC] text-[12px] mt-1">{r.merchantWallet}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.industry}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.totalLoans}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.currentDebtOwed}</td>
                    <td className="px-5 py-5">
                      <span className={['inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium', pill.bg, pill.text].join(' ')}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.receivablesCountLabel}</td>
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

export default AdminMerchantsManagementPage

