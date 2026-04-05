import type { ReactNode } from 'react'

export type FooterSocialLinkProps = {
  href: string
  label: string
  children: ReactNode
}

export function FooterSocialLink({ href, label, children }: FooterSocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="text-slate-500 transition hover:text-slate-800"
    >
      {children}
    </a>
  )
}
