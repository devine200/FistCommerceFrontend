import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type KycStatus = 'Approved' | 'Rejected' | 'Under Review'

type InvestorRow = {
  id: string
  receivableId: string
  investorName: string
  investorWallet: string
  invested: string
  earnings: string
  amountWithdrawn: string
  kycStatus: KycStatus
  receivablesCountLabel: string
}

const SUMMARY = [
  { title: 'Total Investors', value: '121' },
  { title: 'Total Invested', value: '$' },
  { title: 'Total Earnings Paid', value: '$4,900' },
  { title: 'Frozen Accounts', value: '126' },
] as const

const ROWS: InvestorRow[] = [
  {
    id: 'i-1',
    receivableId: 'r-1',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$323,000',
    amountWithdrawn: '-$23,000',
    kycStatus: 'Approved',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'i-2',
    receivableId: 'r-2',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$420,000',
    amountWithdrawn: '$0',
    kycStatus: 'Rejected',
    receivablesCountLabel: '0 Receivables',
  },
  {
    id: 'i-3',
    receivableId: 'r-3',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$103,500',
    amountWithdrawn: '$0',
    kycStatus: 'Under Review',
    receivablesCountLabel: '3 Receivables',
  },
  {
    id: 'i-4',
    receivableId: 'r-4',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$23,000',
    amountWithdrawn: '-$23,000',
    kycStatus: 'Approved',
    receivablesCountLabel: '1 Receivables',
  },
  {
    id: 'i-5',
    receivableId: 'r-5',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$400,000',
    amountWithdrawn: '$0',
    kycStatus: 'Approved',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'i-6',
    receivableId: 'r-6',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$150,000',
    amountWithdrawn: '$0',
    kycStatus: 'Approved',
    receivablesCountLabel: '11 Receivables',
  },
] as const

function statusPill(status: KycStatus) {
  switch (status) {
    case 'Approved':
      return { bg: 'bg-[#E7F6EC]', text: 'text-[#16A34A]' }
    case 'Rejected':
      return { bg: 'bg-[#FBEAE9]', text: 'text-[#EF4444]' }
    case 'Under Review':
      return { bg: 'bg-[#F8EEFC]', text: 'text-[#A855F7]' }
    default:
      return { bg: 'bg-[#EEF0F4]', text: 'text-[#6B7488]' }
  }
}

const AdminInvestorsManagementPage = () => {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter((r) => {
      return (
        r.investorName.toLowerCase().includes(q) ||
        r.investorWallet.toLowerCase().includes(q) ||
        r.kycStatus.toLowerCase().includes(q)
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
            aria-label="Search investors"
          />
        </div>
      </section>

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead>
              <tr className="bg-[#195EBC]">
                {['Investor', 'Invested', 'Earnings', 'Amount Withdrawn', 'KYC Status', 'No. of Receivables', 'Action'].map((h) => (
                  <th key={h} className="text-left text-white text-[14px] font-medium px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredRows.map((r, idx) => {
                const pill = statusPill(r.kycStatus)
                const rowBg = idx % 2 === 1 ? 'bg-[#F3F7FC]' : 'bg-white'
                return (
                  <tr key={r.id} className={rowBg}>
                    <td className="px-5 py-5">
                      <div className="flex flex-col">
                        <span className="text-[#0B1220] text-[14px] font-medium">{r.investorName}</span>
                        <span className="text-[#195EBC] text-[12px] mt-1">{r.investorWallet}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.invested}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.earnings}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">{r.amountWithdrawn}</td>
                    <td className="px-5 py-5">
                      <span className={['inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium', pill.bg, pill.text].join(' ')}>
                        {r.kycStatus}
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

export default AdminInvestorsManagementPage

