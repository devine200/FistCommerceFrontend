import { useMemo, useState, type ReactNode } from 'react'

type TxStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected'

type TxType = 'Deposit' | 'Disbursement' | 'Repayment' | 'Fee' | 'Withdrawal'

type TxRow = {
  id: string
  type: TxType
  detail: ReactNode
  /** Plain text for search (detail is rich React nodes) */
  searchText: string
  amount: string
  date: string
  status: TxStatus
}

const SUMMARY = [
  { title: 'Deposits', value: '$250K' },
  { title: 'Withdrawals', value: '$250K' },
  { title: 'Disbursements', value: '$250K' },
  { title: 'Repayments', value: '$250K' },
  { title: 'Fees', value: '$250K' },
] as const

const TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const
type TabKey = (typeof TABS)[number]

function DetailLine({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-[#0B1220] leading-snug max-w-[420px]">{children}</p>
}

const HIGHLIGHT = 'text-[#195EBC]'

const ROWS: TxRow[] = [
  {
    id: 'TX-123456789',
    type: 'Deposit',
    detail: (
      <DetailLine>
        Investor <span className={HIGHLIGHT}>0x7a3B...3A4B</span> has invested into Fist Commerce lending pool.
      </DetailLine>
    ),
    searchText: 'investor 0x7a3b invested fist commerce lending pool',
    amount: '$24,000',
    date: '18-03-2026',
    status: 'Approved',
  },
  {
    id: 'Slippers Bulk Order',
    type: 'Disbursement',
    detail: (
      <DetailLine>
        Sent <span className={HIGHLIGHT}>$3,000</span> from Titan Growth Fund into Fist Commerce.
      </DetailLine>
    ),
    searchText: 'sent 3000 titan growth fund disbursement',
    amount: '$24,000',
    date: '18-03-2026',
    status: 'Approved',
  },
  {
    id: 'Slippers Bulk Order',
    type: 'Repayment',
    detail: (
      <DetailLine>
        Merchant <span className={HIGHLIGHT}>Ajala Harris</span> repaid <span className={HIGHLIGHT}>$24,000</span> into Fist
        Commerce.
      </DetailLine>
    ),
    searchText: 'merchant ajala harris repaid 24000 repayment',
    amount: '$24,000',
    date: '18-03-2026',
    status: 'Under Review',
  },
  {
    id: 'Slippers Bulk Order',
    type: 'Fee',
    detail: (
      <DetailLine>
        Maintenance fee of <span className={HIGHLIGHT}>$1,300</span> deducted from Fist Commerce treasury.
      </DetailLine>
    ),
    searchText: 'maintenance fee 1300 treasury',
    amount: '$24,000',
    date: '18-03-2026',
    status: 'Approved',
  },
  {
    id: 'Slippers Bulk Order',
    type: 'Withdrawal',
    detail: (
      <DetailLine>
        Investor <span className={HIGHLIGHT}>0x7a3B...3A4B</span> has withdrawn <span className={HIGHLIGHT}>$40,000</span>{' '}
        from the platform.
      </DetailLine>
    ),
    searchText: 'investor 0x7a3b withdrawn 40000 withdrawal',
    amount: '$24,000',
    date: '18-03-2026',
    status: 'Pending',
  },
]

function TxTypeBadge({ type }: { type: TxType }) {
  const label = type
  const icon = (() => {
    switch (type) {
      case 'Deposit':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#16A34A]" aria-hidden>
            <path
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="m8.5 12.5 2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'Disbursement':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#A855F7]" aria-hidden>
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )
      case 'Repayment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#195EBC]" aria-hidden>
            <rect x="4" y="6" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 8.5v7M9.8 10.2c0-.8.7-1.4 1.7-1.4h.9c1 0 1.8.6 1.8 1.4 0 1.2-3.6.6-3.6 2.4 0 .8.8 1.4 1.8 1.4h.9c1 0 1.7-.6 1.7-1.4"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'Fee':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#EA580C]" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M15 9.5a2.5 2.5 0 0 0-4-1.94V7H9v2.56A2.5 2.5 0 0 0 10 14.44V17h2v-2.56a2.5 2.5 0 0 0 1.5-4.56V9.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'Withdrawal':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#DC2626]" aria-hidden>
            <path
              d="M12 19V5M12 5l-4 4M12 5l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return null
    }
  })()

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[#0B1220] text-[14px] font-medium">{label}</span>
    </div>
  )
}

const AdminTransactionsPage = () => {
  const [tab, setTab] = useState<TabKey>('All')
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROWS.filter((r) => {
      const matchesTab = tab === 'All' ? true : r.status === tab
      const haystack = `${r.id} ${r.type} ${r.status} ${r.searchText}`.toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      return matchesTab && matchesQuery
    })
  }, [query, tab])

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {SUMMARY.map((c) => (
          <article key={c.title} className="rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 shadow-sm">
            <p className="text-[#6B7488] text-[14px] font-medium leading-tight">{c.title}</p>
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7488"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a transaction"
              className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[14px] placeholder:text-[#B0B7C4]"
              aria-label="Search for a transaction"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#195EBC]">
                {['Transaction ID', 'Type', 'Detail', 'Amount', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left text-white text-[14px] font-medium px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredRows.map((r, idx) => {
                const rowBg = idx % 2 === 1 ? 'bg-[#F3F7FC]' : 'bg-white'
                return (
                  <tr key={`${r.id}-${r.type}-${idx}`} className={rowBg}>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.id}</td>
                    <td className="px-5 py-5 align-top">
                      <TxTypeBadge type={r.type} />
                    </td>
                    <td className="px-5 py-5 align-top">{r.detail}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.amount}</td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.date}</td>
                    <td className="px-5 py-5 align-top">
                      <button type="button" className="text-[#195EBC] text-[14px] underline underline-offset-2">
                        View Details
                      </button>
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

export default AdminTransactionsPage
