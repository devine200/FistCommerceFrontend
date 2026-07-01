import { useCallback, useEffect, useState } from 'react'

import { fetchPublicContactSocialLinks } from '@/api/adminContactSocialLinks'
import { LANDING_CONTACT_EMAIL } from '@/components/landing'
import { FooterSocialLink } from '@/components/landing/FooterSocialLink'
import DashboardBorderedPanel from '@/components/dashboard/shared/DashboardBorderedPanel'
import { contactSocialLinkItems } from '@/utils/contactSocialLinks'

export function SupportContactContent() {
  const [email, setEmail] = useState(LANDING_CONTACT_EMAIL)
  const [socialLinks, setSocialLinks] = useState(() => contactSocialLinkItems({
    email: LANDING_CONTACT_EMAIL,
    telegram: 'https://t.me/',
    linkedin: 'https://www.linkedin.com/',
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
  }))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchPublicContactSocialLinks()
      .then((links) => {
        if (cancelled) return
        if (links.email?.trim()) setEmail(links.email.trim())
        setSocialLinks(contactSocialLinkItems(links))
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Could not load support contact information.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [email])

  return (
    <div className="flex flex-col gap-4">
      <DashboardBorderedPanel title="Support & disputes" panelClassName="p-5 sm:p-6">
        <p className="text-[#6B7488] text-[14px] leading-relaxed -mt-2">
          Reach our support team for help with your account, transactions, KYC, or dispute inquiries.
          We typically respond by email within one business day.
        </p>

        {loading ? (
          <p className="text-[#6B7488] text-[14px]">Loading contact information…</p>
        ) : null}

        {error ? (
          <p className="text-[#DC2626] text-[14px]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#6B7488]">Support email</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href={`mailto:${email}`}
              className="text-[#195EBC] text-[16px] font-semibold hover:underline break-all"
            >
              {email}
            </a>
            <button
              type="button"
              onClick={() => void copyEmail()}
              className="h-9 px-4 rounded-[6px] border border-[#E6E8EC] bg-white text-[#0B1220] text-[13px] font-semibold hover:bg-[#F9FAFB] transition-colors w-fit"
            >
              {copied ? 'Copied' : 'Copy email'}
            </button>
          </div>
        </div>
      </DashboardBorderedPanel>

      <DashboardBorderedPanel title="Connect with us" panelClassName="p-5 sm:p-6">
        <p className="text-[#6B7488] text-[14px] leading-relaxed -mt-2">
          Follow Fist Commerce on social channels for product updates and announcements.
        </p>
        <div className="flex flex-wrap items-center gap-5 pt-1">
          {socialLinks.map((link) => (
            <FooterSocialLink key={link.label} href={link.href} label={link.label}>
              {link.icon}
            </FooterSocialLink>
          ))}
        </div>
      </DashboardBorderedPanel>
    </div>
  )
}
