import type { MouseEvent, ReactNode } from 'react'

export type AdminPageFrameProps = {
  children: ReactNode
  className?: string
}

export type AdminStatCardProps = {
  title: string
  value: ReactNode
  /** default: title uses primary text; muted: gray label (transactions / notifications style) */
  titleTone?: 'default' | 'muted'
  /** Extra classes for the title line (e.g. `leading-snug` for long labels) */
  titleClassName?: string
  className?: string
}

export type AdminStatGridProps = {
  children: ReactNode
  /** Tailwind grid column classes, e.g. `grid-cols-1 sm:grid-cols-2 xl:grid-cols-5` */
  columnsClassName?: string
  className?: string
}

export type AdminSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  'aria-label': string
  /** Applied to outer wrapper (width constraints) */
  className?: string
}

export type AdminPanelProps = {
  children: ReactNode
  className?: string
}

export type AdminToolbarRowProps = {
  /** Typically filter tabs */
  start: ReactNode
  /** Typically search; omit for tabs-only toolbars */
  end?: ReactNode
  className?: string
}

export type AdminTabItem<T extends string = string> = {
  value: T
  label: string
}

export type AdminSegmentedTabsVariant = 'toolbar' | 'alerts'

export type AdminSegmentedTabsProps<T extends string> = {
  items: readonly AdminTabItem<T>[]
  value: T
  onChange: (value: T) => void
  /**
   * toolbar: bordered chips (receivables / transactions)
   * alerts: larger radius, inactive tabs use #4D5D80 (notifications page)
   */
  variant?: AdminSegmentedTabsVariant
}

export type AdminTableShellProps = {
  children: ReactNode
  minWidthClassName?: string
}

export type AdminTableHeadRowProps = {
  labels: readonly string[]
}

export type AdminPillVariant =
  | 'approved'
  | 'rejected'
  | 'underReview'
  | 'pending'
  | 'active'
  | 'late'
  | 'neutral'

export type AdminStatusPillProps = {
  variant: AdminPillVariant
  children: ReactNode
  className?: string
}

export type AdminPartyStackProps = {
  primary: string
  secondary: string
  /** Loan monitoring uses an underlined wallet line */
  secondaryUnderline?: boolean
}

export type AdminTableTextLinkProps = {
  to: string
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}
