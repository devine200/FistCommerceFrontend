import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import landingLendingPoolDashboard from '@/assets/landing-lending-pool-dashboard.png'
import {
  LandingFaqSection,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingInvestorsSection,
  LandingLendingPoolSection,
  LandingMerchantsSection,
  LandingMissionStatement,
  LandingStatsMissionSection,
  LANDING_CONTACT_EMAIL,
  LANDING_FAQS,
  LANDING_FOOTER_COLUMNS,
  LANDING_INVESTOR_PANELS,
  LANDING_MERCHANT_BENEFITS,
  LANDING_STATS,
} from '@/components/landing'
import { useSession } from '@/state/useSession'
import { dashboardOverviewPath, parseUserRole } from '@/utils/userRole'

export default function LandingPage() {
  const navigate = useNavigate()
  const { onboarded, role } = useSession()
  const [copied, setCopied] = useState(false)

  const goToApp = useCallback(() => {
    const normalizedRole = parseUserRole(role)
    if (onboarded && normalizedRole) {
      navigate(dashboardOverviewPath(normalizedRole))
      return
    }
    navigate('/onboarding')
  }, [navigate, onboarded, role])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LANDING_CONTACT_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <LandingHeader />

      <main id="top">
        <LandingHero
          title="Bridging Real-World Assets with On-Chain Capital."
          description="A decentralized infrastructure for financing receivables and accessing yield from verified off-chain transactions — securely and transparently."
          ctaLabel="Go to app"
          onCtaClick={goToApp}
        />

        <LandingStatsMissionSection
          stats={LANDING_STATS}
          mission={
            <LandingMissionStatement
              leadBold="Our mission"
              segmentBeforeEmphasis="is to unlock global liquidity by "
              emphasis="connecting real-world assets with digital capital"
              segmentAfterEmphasis=", enabling businesses to access funding seamlessly "
              mutedClosing="while providing investors with transparent, structured opportunities for yield."
            />
          }
        />

        <LandingLendingPoolSection
          title="Structured capital, deployed efficiently"
          description="Capital flows into a unified lending pool, enabling seamless allocation into verified receivables with transparent returns and defined terms."
          ctaLabel={onboarded ? 'Go to app' : 'Get started'}
          onCtaClick={goToApp}
          visual={
            <img
              src={landingLendingPoolDashboard}
              alt="Dashboard mockup for Fist Commerce Lending Pool showing financial metrics like total deposited, liquid assets, and loan interest, with overlapping status cards for funded receivables and joining the pool."
              className="h-auto w-full object-contain object-center md:h-full md:w-[80vw] md:max-w-none"
              decoding="async"
            />
          }
        />

        <LandingMerchantsSection
          badge="For merchants"
          title="Gain greater control over cash flow."
          description="Access working capital from outstanding invoices and maintain operational stability without traditional financing constraints."
          benefits={LANDING_MERCHANT_BENEFITS}
        />

        <LandingInvestorsSection
          badge="For investors"
          title="Consistent access to structured returns."
          description="Participate in short-term, asset-backed opportunities with transparent terms and clearly defined outcomes."
          panels={LANDING_INVESTOR_PANELS}
        />

        <LandingFaqSection items={LANDING_FAQS} />
      </main>

      <LandingFooter
        contactHeading="Start participating in the future of finance"
        email={LANDING_CONTACT_EMAIL}
        copied={copied}
        onCopyEmail={copyEmail}
        columns={LANDING_FOOTER_COLUMNS}
        legalBar={{ copyright: '© Fist Commerce 2026. All Rights Reserved.' }}
      />
    </div>
  )
}
