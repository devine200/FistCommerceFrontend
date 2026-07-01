import type { AdminContactSocialLinks } from '@/api/adminContactSocialLinks'
import { LANDING_SOCIAL_DEFAULTS } from '@/components/landing/landingFooterSocial'
import type { LandingSocialLinkItem } from '@/components/landing/types'

const SOCIAL_ICON_BY_LABEL = new Map(
  LANDING_SOCIAL_DEFAULTS.map((item) => [item.label.toLowerCase(), item.icon]),
)

function socialItem(label: string, href: string): LandingSocialLinkItem | null {
  const url = href.trim()
  if (!url) return null
  const icon = SOCIAL_ICON_BY_LABEL.get(label.toLowerCase())
  if (!icon) return null
  return { label, href: url, icon }
}

/** Map `GET /api/config/contact/` fields to footer / support social link rows. */
export function contactSocialLinkItems(links: AdminContactSocialLinks): LandingSocialLinkItem[] {
  return [
    socialItem('Facebook', links.facebook),
    socialItem('LinkedIn', links.linkedin),
    socialItem('Instagram', links.instagram),
    socialItem('Telegram', links.telegram),
  ].filter((item): item is LandingSocialLinkItem => item !== null)
}
