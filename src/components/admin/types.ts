import type { ReactNode } from 'react'

export type AdminNavItem = {
  to: string
  label: string
  iconSrc: string
  /** Asset is already #195EBC; keep that color in both active and inactive states */
  iconAlwaysBrandBlue?: true
}

export type AdminSideNavProps = {
  expanded: boolean
  onToggleExpanded: () => void
  onRequestClose?: () => void
}

export type AdminTopBarProps = {
  title: string
  /** When set, replaces the main title area (e.g. breadcrumb on investor profile). */
  leading?: ReactNode
  notificationUnread?: boolean
  onMenuClick?: () => void
  menuButtonAriaLabel?: string
  /** Truncated wallet address — when set, shows wallet chip (replaces legacy email row) */
  walletDisplay?: string
}

export type AdminBellIconProps = {
  className?: string
}
