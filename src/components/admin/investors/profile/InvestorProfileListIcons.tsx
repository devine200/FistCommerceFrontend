import type { ActivityKind } from '@/components/admin/investors/investorsMockData'

/** Slightly rounded square frame for profile activity-style rows (not circles). */
const ICON_SQUARE_FRAME = 'rounded-[6px]'

export type InvestIconProps = {
  className?: string
  /** Square with light rounding (activity / investment list rows on profile) */
  square?: boolean
}

export function InvestIcon({ className, square }: InvestIconProps) {
  return (
    <span
      className={[
        'inline-flex h-10 w-10 shrink-0 items-center justify-center bg-[#E8EFFB]',
        square ? ICON_SQUARE_FRAME : 'rounded-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#195EBC]" aria-hidden>
        <path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function EarnIcon() {
  return (
    <span className={['inline-flex h-10 w-10 shrink-0 items-center justify-center bg-[#DCFCE7]', ICON_SQUARE_FRAME].join(' ')} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#16A34A]" aria-hidden>
        <path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function WithdrawIcon() {
  return (
    <span className={['inline-flex h-10 w-10 shrink-0 items-center justify-center bg-[#FFEDD5]', ICON_SQUARE_FRAME].join(' ')} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#EA580C]" aria-hidden>
        <path d="M12 19V5M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function ActivityKindIcon({ kind }: { kind: ActivityKind }) {
  if (kind === 'earn') return <EarnIcon />
  if (kind === 'withdraw') return <WithdrawIcon />
  return <InvestIcon square />
}

export function activityAmountClassName(kind: ActivityKind): string {
  if (kind === 'earn') return 'text-[#16A34A] font-semibold'
  if (kind === 'withdraw') return 'text-[#EA580C] font-semibold'
  return 'text-[#0B1220] font-semibold'
}

export function ListRowChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF] shrink-0" aria-hidden>
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
