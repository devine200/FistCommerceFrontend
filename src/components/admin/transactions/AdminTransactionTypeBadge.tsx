import type { AdminTransactionType } from '@/api/adminTransactions'

type AdminTransactionTypeBadgeProps = {
  type: AdminTransactionType
  typeLabel: string
}

function TypeIcon({ type }: { type: AdminTransactionType }) {
  switch (type) {
    case 'deposit':
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
    case 'disbursement':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#A855F7]" aria-hidden>
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'repayment':
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
    case 'fee':
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
    case 'withdrawal':
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
}

export default function AdminTransactionTypeBadge({ type, typeLabel }: AdminTransactionTypeBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <TypeIcon type={type} />
      <span className="text-[#0B1220] text-[14px] font-medium">{typeLabel}</span>
    </div>
  )
}
