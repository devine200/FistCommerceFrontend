import { Link } from 'react-router-dom'

import type { LandingFooterColumn } from '@/components/landing/types'

import { LandingFooterLegalBar } from '@/components/landing/LandingFooterLegalBar'
import type { LandingFooterLegalBarProps } from '@/components/landing/LandingFooterLegalBar'

export type LandingFooterProps = {
  contactEyebrow?: string
  contactHeading: string
  emailLabel?: string
  email: string
  copied: boolean
  onCopyEmail: () => void
  columns: LandingFooterColumn[]
  legalBar: LandingFooterLegalBarProps
}

export function LandingFooter({
  contactEyebrow = 'Contact us',
  contactHeading,
  emailLabel = 'Email Us At:',
  email,
  copied,
  onCopyEmail,
  columns,
  legalBar,
}: LandingFooterProps) {
  return (
    <footer className="bg-[#060d18] text-white">
      <div className="mx-auto w-[90%] py-14 sm:py-16">
        <p className="text-sm font-medium text-sky-300/90">{contactEyebrow}</p>
        <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{contactHeading}</h2>
            <p className="mt-6 text-sm text-white/75">{emailLabel}</p>
            <button
              type="button"
              onClick={onCopyEmail}
              className="mt-3 inline-flex w-fit max-w-full items-center gap-3 rounded-full bg-[#0e1f38] px-5 py-3 text-left text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-[#122a47] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
              aria-label={copied ? 'Email copied' : `Copy ${email} to clipboard`}
            >
              <span className="select-text text-sm">{email}</span>
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white"
                aria-hidden
              >
                {copied ? (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </span>
            </button>
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-24">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white/90">{col.title}</p>
                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.variant === 'hash' ? (
                        <a href={link.href} className="transition hover:text-white">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.to} className="transition hover:text-white">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LandingFooterLegalBar {...legalBar} />
    </footer>
  )
}
