import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

function statusPill(status: ReceivableStatus) {
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

const AdminReceivablesManagementPage = () => {
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
    <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY.map((c) => (
          <article key={c.title} className="rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 shadow-sm">
            <p className="text-[#0B1220] text-[14px] font-medium leading-tight">{c.title}</p>
            <p className="text-[#0B1220] text-[24px] font-semibold leading-tight mt-3">{c.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((t) => {
              const active = t === tab
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={[
                    'h-[40px] px-5 rounded-[6px] text-[14px] font-medium border transition-colors',
                    active
                      ? 'bg-[#195EBC] text-white border-[#195EBC]'
                      : 'bg-white text-[#6B7488] border-[#E6E8EC] hover:bg-[#F9FAFB]',
                  ].join(' ')}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <div className="w-full lg:w-[300px] h-[44px] rounded-[6px] border border-[#E6E8EC] bg-white px-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7488" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a receivable"
              className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[14px] placeholder:text-[#B0B7C4]"
              aria-label="Search for a receivable"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-[#195EBC]">
                {['Merchant', 'Receivable', 'Loan Amount', 'Period', 'Documents', 'Status', 'Action'].map((h) => (
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
                  <tr key={`${r.merchantWallet}-${r.receivable}-${idx}`} className={rowBg}>
                    <td className="px-5 py-5">
                      <div className="flex flex-col">
                        <span className="text-[#0B1220] text-[14px] font-medium">{r.merchantName}</span>
                        <span className="text-[#195EBC] text-[12px] mt-1">{r.merchantWallet}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <Link
                        to={`/dashboard/admin/receivables/${r.id}`}
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
                      <span className={['inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium', pill.bg, pill.text].join(' ')}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <Link
                        to={`/dashboard/admin/receivables/${r.id}`}
                        className="text-[#195EBC] text-[14px] underline underline-offset-2"
                      >
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

export default AdminReceivablesManagementPage
