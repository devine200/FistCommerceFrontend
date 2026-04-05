import { useMemo, useState, type ReactNode } from 'react'

import {
  AdminPageFrame,
  AdminPanel,
  AdminSearchField,
  AdminSegmentedTabs,
  AdminStatCard,
  AdminStatGrid,
  AdminTableHeadRow,
  AdminTableShell,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminTabItem,
} from '@/components/admin/primitives'
import AdminTransactionDetailsModal, {
  type AdminTransactionDetail,
} from '@/components/admin/transactions/AdminTransactionDetailsModal'

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
  modal: AdminTransactionDetail
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

const TAB_ITEMS: AdminTabItem<TabKey>[] = TABS.map((t) => ({ value: t, label: t }))

const TX_TABLE_HEADERS = ['Transaction ID', 'Type', 'Detail', 'Amount', 'Date', 'Action'] as const

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
    modal: {
      summaryLabel: 'Deposit Confirmed',
      amountDisplay: '+$24,000',
      flow: 'in',
      partyLabel: 'Investor Name',
      partyName: 'Elena Vasquez',
      transactionId: 'TX-123456789',
      dateTime: '18/03/26 • 14:22PM',
      transactionType: 'Deposit',
      status: 'Approved',
      transactionAmount: '$24,000',
      feesDeducted: '$0',
      netReceived: '$24,000',
      walletAddress: '0x7a3B...3A4B',
      network: 'Arbitrum',
    },
  },
  {
    id: 'DISB-88421',
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
    modal: {
      summaryLabel: 'Disbursement Sent',
      amountDisplay: '$24,000',
      flow: 'neutral',
      partyLabel: 'Fund Name',
      partyName: 'Titan Growth Fund',
      transactionId: 'DISB-88421',
      dateTime: '18/03/26 • 09:05AM',
      transactionType: 'Disbursement',
      status: 'Approved',
      transactionAmount: '$24,000',
      feesDeducted: '$120',
      netReceived: '$23,880',
      walletAddress: '0x4C2E...91B0',
      network: 'Arbitrum',
    },
  },
  {
    id: 'REP-77219',
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
    modal: {
      summaryLabel: 'Repayment Received',
      amountDisplay: '+$24,000',
      flow: 'in',
      partyLabel: 'Merchant Name',
      partyName: 'Ajala Harris',
      transactionId: 'REP-77219',
      dateTime: '18/03/26 • 11:40AM',
      transactionType: 'Repayment',
      status: 'Under Review',
      transactionAmount: '$24,000',
      feesDeducted: '$0',
      netReceived: '$24,000',
      walletAddress: '0x9F1A...62D4',
      network: 'Arbitrum',
    },
  },
  {
    id: 'FEE-11002',
    type: 'Fee',
    detail: (
      <DetailLine>
        Maintenance fee of <span className={HIGHLIGHT}>$1,300</span> deducted from Fist Commerce treasury.
      </DetailLine>
    ),
    searchText: 'maintenance fee 1300 treasury',
    amount: '$1,300',
    date: '18-03-2026',
    status: 'Approved',
    modal: {
      summaryLabel: 'Fee Processed',
      amountDisplay: '-$1,300',
      flow: 'out',
      partyLabel: 'Account',
      partyName: 'Fist Commerce Treasury',
      transactionId: 'FEE-11002',
      dateTime: '17/03/26 • 08:00AM',
      transactionType: 'Fee',
      status: 'Approved',
      transactionAmount: '$1,300',
      feesDeducted: '$0',
      netReceived: '$1,300',
      walletAddress: '0xTreasury...FC01',
      network: 'Arbitrum',
    },
  },
  {
    id: '9I8U7Y6TRF',
    type: 'Withdrawal',
    detail: (
      <DetailLine>
        Investor <span className={HIGHLIGHT}>0x7A3F...92C1</span> has withdrawn <span className={HIGHLIGHT}>$10,000</span>{' '}
        from the platform.
      </DetailLine>
    ),
    searchText: 'investor 0x7a3f withdrawn 10000 withdrawal',
    amount: '$10,000',
    date: '18-03-2026',
    status: 'Pending',
    modal: {
      summaryLabel: 'Withdrawal Initiated',
      amountDisplay: '-$10,000',
      flow: 'out',
      partyLabel: 'Investor Name',
      partyName: 'Tony Montana',
      transactionId: '9I8U7Y6TRF',
      dateTime: '10/06/25 • 20:18PM',
      transactionType: 'Withdrawal',
      status: 'Pending',
      transactionAmount: '$10,000',
      feesDeducted: '$240',
      netReceived: '$9,760',
      walletAddress: '0x7A3F...92C1',
      network: 'Arbitrum',
    },
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
  const [selectedDetail, setSelectedDetail] = useState<AdminTransactionDetail | null>(null)

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
    <AdminPageFrame>
      <AdminStatGrid columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {SUMMARY.map((c) => (
          <AdminStatCard key={c.title} title={c.title} value={c.value} titleTone="muted" />
        ))}
      </AdminStatGrid>

      <AdminPanel>
        <AdminToolbarRow
          start={<AdminSegmentedTabs items={TAB_ITEMS} value={tab} onChange={setTab} />}
          end={
            <AdminSearchField
              value={query}
              onChange={setQuery}
              placeholder="Search for a transaction"
              aria-label="Search for a transaction"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1000px]">
          <AdminTableHeadRow labels={TX_TABLE_HEADERS} />
          <tbody className="bg-white">
            {filteredRows.map((r, idx) => (
              <tr
                key={`${r.id}-${r.type}-${idx}`}
                className={[adminZebraRowClass(idx), 'cursor-pointer hover:bg-[#E8EFF8]/80 transition-colors'].join(' ')}
                onClick={() => setSelectedDetail(r.modal)}
              >
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.id}</td>
                <td className="px-5 py-5 align-top">
                  <TxTypeBadge type={r.type} />
                </td>
                <td className="px-5 py-5 align-top">{r.detail}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.amount}</td>
                <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium align-top">{r.date}</td>
                <td className="px-5 py-5 align-top">
                  <button
                    type="button"
                    className="text-[#195EBC] text-[14px] underline underline-offset-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDetail(r.modal)
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      </AdminPanel>

      <AdminTransactionDetailsModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </AdminPageFrame>
  )
}

export default AdminTransactionsPage
