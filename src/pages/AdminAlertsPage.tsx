import { useMemo, useState, type MouseEvent } from 'react'

import {
  AdminAlertModalRouter,
  type AlertModalDetail,
} from '@/components/admin/alerts/AdminAlertModals'
import {
  AdminPageFrame,
  AdminSegmentedTabs,
  AdminStatCard,
  AdminStatGrid,
  type AdminTabItem,
} from '@/components/admin/primitives'

type Severity = 'critical' | 'warning' | 'info'

type FilterTab = 'all' | Severity

type NotificationItem = {
  id: string
  severity: Severity
  title: string
  description: string
  timeLabel: string
  read: boolean
  dismissed: boolean
  detail: AlertModalDetail
}

const INITIAL: NotificationItem[] = [
  {
    id: 'n-1',
    severity: 'critical',
    title: 'Loan Default Detected',
    description: 'Loan ID LN-4176 · Global Exports Co. · Missed repayment $9,500',
    timeLabel: '2 hr ago',
    read: false,
    dismissed: false,
    detail: {
      kind: 'loan-default',
      receivableId: 'r-1',
      subtitle: 'Global Exports Co. missed repayment of $9,500 on Alpha Returns Fund.',
      merchantName: 'Joe Sandals',
      receivableName: 'Slippers Bulk Order',
      invoiceAmount: '$18,000',
      statusLine: '30 Days Late (Default)',
    },
  },
  {
    id: 'n-2',
    severity: 'warning',
    title: 'Late Repayment',
    description: 'Loan ID LN-4190 · Nexus Advisory · $18,000 on Slippers Bulk Order',
    timeLabel: '3 hr ago',
    read: false,
    dismissed: false,
    detail: {
      kind: 'late-repayment',
      receivableId: 'r-2',
      subtitle: 'Nexus Advisory has defaulted on $18,000 loan in Slippers Bulk Order',
      merchantName: 'Joe Sandals',
      receivableName: 'Slippers Bulk Order',
      invoiceAmount: '$18,000',
      statusLine: '2 Days Late',
    },
  },
  {
    id: 'n-3',
    severity: 'info',
    title: 'Large Withdrawal',
    description: 'Investor 0x7a3B…3A4B · $50,000 from Fist Commerce Pool',
    timeLabel: '5 hr ago',
    read: false,
    dismissed: false,
    detail: {
      kind: 'large-withdrawal',
      subtitle: 'Investor 0x7a3B…3A4B withdrew $50,000 from Fist Commerce Pool',
      investorName: 'Joe Sandals',
      walletAddress: '0x7a3B…3A4B',
      withdrawalAmount: '$50,000',
      statusLine: 'Pending review',
    },
  },
  {
    id: 'n-4',
    severity: 'warning',
    title: 'Late Repayment',
    description: 'Loan ID LN-4165 · Meridian Retail · $12,400 outstanding',
    timeLabel: '1 day ago',
    read: true,
    dismissed: false,
    detail: {
      kind: 'late-repayment',
      receivableId: 'r-3',
      subtitle: 'Meridian Retail is late on $12,400 for invoice financing.',
      merchantName: 'Meridian Retail',
      receivableName: 'Q2 Inventory',
      invoiceAmount: '$12,400',
      statusLine: '5 Days Late',
    },
  },
  {
    id: 'n-5',
    severity: 'info',
    title: 'Large Withdrawal',
    description: 'Investor 0x9c2D…8F01 · $22,000 from Growth Pool',
    timeLabel: '2 days ago',
    read: true,
    dismissed: false,
    detail: {
      kind: 'large-withdrawal',
      subtitle: 'Investor 0x9c2D…8F01 withdrew $22,000 from Growth Pool',
      investorName: 'Alex Chen',
      walletAddress: '0x9c2D…8F01',
      withdrawalAmount: '$22,000',
      statusLine: 'Completed',
    },
  },
  {
    id: 'n-6',
    severity: 'warning',
    title: 'Late Repayment',
    description: 'Loan ID LN-4150 · Harbor Foods · Grace period ending',
    timeLabel: '3 days ago',
    read: true,
    dismissed: false,
    detail: {
      kind: 'late-repayment',
      receivableId: 'r-4',
      subtitle: 'Harbor Foods is approaching default on seasonal stock loan.',
      merchantName: 'Harbor Foods',
      receivableName: 'Seasonal Stock',
      invoiceAmount: '$8,200',
      statusLine: '1 Day Late',
    },
  },
]

function severityBorder(sev: Severity) {
  switch (sev) {
    case 'critical':
      return 'border-[#EF4444]'
    case 'warning':
      return 'border-[#F97316]'
    case 'info':
      return 'border-[#195EBC]'
    default:
      return 'border-[#E6E8EC]'
  }
}

function SeverityIcon({ severity }: { severity: Severity }) {
  const box = 'w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0'
  if (severity === 'critical') {
    return (
      <div className={[box, 'bg-[#FEF2F2] text-[#DC2626]'].join(' ')} aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
    )
  }
  if (severity === 'warning') {
    return (
      <div className={[box, 'bg-[#FFF7ED] text-[#EA580C]'].join(' ')} aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
    )
  }
  return (
    <div className={[box, 'bg-[#EFF6FF] text-[#195EBC]'].join(' ')} aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="m8 11 4 4 4-4" />
        <path d="M4 21h16" />
      </svg>
    </div>
  )
}

const ALERT_TAB_ITEMS: AdminTabItem<FilterTab>[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

const AdminAlertsPage = () => {
  const [items, setItems] = useState<NotificationItem[]>(INITIAL)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [modalDetail, setModalDetail] = useState<AlertModalDetail | null>(null)

  const visible = useMemo(() => items.filter((i) => !i.dismissed), [items])

  const filtered = useMemo(() => {
    if (filter === 'all') return visible
    return visible.filter((i) => i.severity === filter)
  }, [visible, filter])

  const unreadCount = useMemo(() => visible.filter((i) => !i.read).length, [visible])

  const markRead = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)))
  }

  const dismiss = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i)))
  }

  const openModal = (item: NotificationItem) => {
    setModalDetail(item.detail)
  }

  return (
    <AdminPageFrame>
      <AdminStatGrid>
        <AdminStatCard title="Total Alerts" value={visible.length} titleTone="muted" />
        <AdminStatCard title="Unread" value={unreadCount} titleTone="muted" />
        <AdminStatCard title="Critical" value="32" titleTone="muted" />
        <AdminStatCard title="Resolved (7Days)" value="1" titleTone="muted" titleClassName="leading-snug" />
      </AdminStatGrid>

      <div className="flex flex-wrap gap-2">
        <AdminSegmentedTabs items={ALERT_TAB_ITEMS} value={filter} onChange={setFilter} variant="alerts" />
      </div>

      <ul className="flex flex-col gap-4 list-none p-0 m-0">
        {filtered.map((item) => (
          <li key={item.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => openModal(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openModal(item)
                }
              }}
              className={[
                'rounded-[10px] border-2 bg-white p-4 sm:p-5 shadow-sm flex gap-4 items-start cursor-pointer text-left w-full',
                severityBorder(item.severity),
                item.read ? 'opacity-55' : 'opacity-100',
              ].join(' ')}
            >
              <SeverityIcon severity={item.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[#0B1220] text-[15px] font-semibold">{item.title}</h2>
                  {!item.read ? (
                    <span className="w-2 h-2 rounded-full bg-[#195EBC] shrink-0" aria-label="Unread" />
                  ) : null}
                </div>
                <p className="text-[#4D5D80] text-[14px] mt-1 leading-snug">{item.description}</p>
                <p className="text-[#9CA3AF] text-[13px] mt-3">{item.timeLabel}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start pt-0.5">
                {!item.read ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      markRead(item.id)
                    }}
                    className="w-9 h-9 rounded-[8px] border border-[#E6E8EC] flex items-center justify-center text-[#16A34A] hover:bg-[#F0FDF4]"
                    aria-label="Mark as read"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(e) => dismiss(item.id, e)}
                  className="w-9 h-9 rounded-[8px] border border-[#E6E8EC] flex items-center justify-center text-[#6B7488] hover:bg-[#F3F4F6]"
                  aria-label="Dismiss"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="text-[#6B7488] text-[14px] text-center py-12">No notifications in this filter.</p>
      ) : null}

      <AdminAlertModalRouter detail={modalDetail} onClose={() => setModalDetail(null)} />
    </AdminPageFrame>
  )
}

export default AdminAlertsPage
