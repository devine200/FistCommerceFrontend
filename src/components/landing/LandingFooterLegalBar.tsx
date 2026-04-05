import { FooterSocialLink } from '@/components/landing/FooterSocialLink'
import { LANDING_SOCIAL_DEFAULTS } from '@/components/landing/landingFooterSocial'
import type { LandingSocialLinkItem } from '@/components/landing/types'

export type LandingFooterLegalBarProps = {
  copyright: string
  /** Defaults to built-in Facebook / LinkedIn / Instagram / Telegram row */
  socialLinks?: LandingSocialLinkItem[]
}

export function LandingFooterLegalBar({
  copyright,
  socialLinks = LANDING_SOCIAL_DEFAULTS,
}: LandingFooterLegalBarProps) {
  return (
    <div className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex w-[90%] flex-row flex-wrap items-center justify-between gap-4 py-6">
        <p className="text-sm text-slate-600">{copyright}</p>
        <div className="flex items-center gap-6">
          {socialLinks.map((s) => (
            <FooterSocialLink key={s.label} href={s.href} label={s.label}>
              {s.icon}
            </FooterSocialLink>
          ))}
        </div>
      </div>
    </div>
  )
}
