import type { ReactNode } from 'react'

export type LandingStatItem = {
  label: string
  value: string
}

export type LandingMerchantBenefitItem = {
  id: string
  prefix: string
  text: string
  /** Tailwind background class for the row (e.g. bg-blue-600) */
  toneClassName: string
}

export type LandingInvestorPanelItem = {
  id: string
  short: string
  title: string
  body: string
  toneClassName: string
}

export type LandingFaqItem = {
  id: string
  question: string
  answer: string
}

export type LandingFooterNavLink =
  | { label: string; href: string; variant: 'hash' }
  | { label: string; to: string; variant: 'route' }

export type LandingFooterColumn = {
  title: string
  links: LandingFooterNavLink[]
}

export type LandingSocialLinkItem = {
  href: string
  label: string
  icon: ReactNode
}

export type LandingLendingPoolSectionProps = {
  sectionId?: string
  title: string
  description: string
  ctaLabel: string
  onCtaClick: () => void
  /** Dashboard mockup: `<img />` or other visual node */
  visual: ReactNode
  /** e.g. min height wrapper for the visual */
  visualWrapperClassName?: string
}
