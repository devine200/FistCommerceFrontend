import { useCallback, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import landingLendingPoolDashboard from '@/assets/landing-lending-pool-dashboard.png'
import { FistCommerceLogo } from '@/components/landing/FistCommerceLogo'
import { useSession } from '@/state/useSession'

const STATS = [
  { label: 'Receivables Processed', value: '$240k+' },
  { label: 'Avg Funding Time', value: '<48 Hours' },
  { label: 'Average Returns', value: '4-12%' },
  { label: 'Verified Transactions', value: '100%' },
] as const

const MERCHANT_BENEFITS = [
  { n: '1.', text: 'Faster access to capital', className: 'bg-blue-600' },
  { n: '2.', text: 'Improved cash flow management', className: 'bg-lime-500' },
  { n: '3.', text: 'No traditional debt burden', className: 'bg-fuchsia-600' },
  { n: '4.', text: 'Simple, transparent process', className: 'bg-orange-500' },
] as const

const INVESTOR_ITEMS = [
  {
    short: 'Real-world yield',
    title: '1. Access to real-world yield',
    body: 'Earn returns backed by verified, asset-backed receivables generated from actual business transactions. Each opportunity is tied to real invoices and underlying commercial activity, providing a more tangible and transparent source of yield compared to purely speculative assets.',
    className: 'bg-blue-600',
  },
  {
    short: 'Short-duration opportunities',
    title: '2. Short-duration investment opportunities',
    body: 'Deploy capital into short-horizon, structured placements with clear timelines and defined cash flow expectations—designed for investors who value liquidity planning alongside yield.',
    className: 'bg-lime-500',
  },
  {
    short: 'Transparent risk & return',
    title: '3. Transparent risk & return structure',
    body: 'Terms, collateral context, and repayment mechanics are presented upfront so you can evaluate each opportunity on its merits—with fewer surprises and more clarity.',
    className: 'bg-fuchsia-600',
  },
  {
    short: 'Diversified exposure',
    title: '4. Diversified exposure',
    body: 'Participate across a pipeline of verified receivables and merchant programs to spread exposure while staying inside a consistent underwriting framework.',
    className: 'bg-orange-500',
  },
] as const

const FAQS = [
  {
    q: 'What is Fist Commerce?',
    a: 'Fist Commerce connects real-world receivables with on-chain capital—helping businesses access funding while giving investors transparent, structured opportunities.',
  },
  {
    q: 'How does onboarding work?',
    a: 'Choose whether you are a merchant or investor, connect a wallet, and complete the guided steps. You can start from the “Get funding” or “Start investing” actions in the top bar.',
  },
  {
    q: 'Is my capital at risk?',
    a: 'All financing involves risk. Opportunities are presented with defined terms, but outcomes depend on borrower performance and market conditions. Review each opportunity carefully.',
  },
] as const

const CONTACT_EMAIL = 'hey@fistcommerce@gmail.com'

function FooterSocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
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

export default function LandingPage() {
  const navigate = useNavigate()
  const { onboarded, role } = useSession()
  const [activeInvestor, setActiveInvestor] = useState(0)
  const [copied, setCopied] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const goToApp = useCallback(() => {
    if (onboarded) {
      navigate(`/dashboard/${role}/overview`)
      return
    }
    navigate('/onboarding')
  }, [navigate, onboarded, role])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Top bar — dark, matches hero (desktop + mobile) */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060d18]/90 backdrop-blur-md">
        <div className="mx-auto flex w-[90%] items-center justify-between gap-3 py-3">
          <FistCommerceLogo />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/onboarding/merchant/choose-role"
              className="rounded-lg bg-[#0b1628] px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-[#111f35] sm:px-4 sm:text-sm"
            >
              Get funding
            </Link>
            <Link
              to="/onboarding/investor/choose-role"
              className="rounded-lg bg-[#1d6cff] px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/35 transition hover:bg-[#3b7fff] sm:px-4 sm:text-sm"
            >
              Start investing
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero — content anchored to bottom; half-moon glow along lower curve */}
        <section className="relative flex min-h-[900px] flex-col justify-end overflow-hidden bg-[#060d18] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-28 lg:pt-32">
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[18%]"
            style={{ width: 'min(125vw, 960px)' }}
            aria-hidden
          >
            <div
              className="w-full bg-linear-to-t from-cyan-400/45 via-sky-400/25 to-transparent blur-[52px]"
              style={{
                height: 'calc(min(125vw, 960px) / 2)',
                borderTopLeftRadius: '9999px',
                borderTopRightRadius: '9999px',
              }}
            />
          </div>
          <div className="relative z-10 mx-auto w-[90%]">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-20 xl:gap-24">
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:max-w-3xl lg:text-6xl xl:text-7xl">
                Bridging Real-World Assets with On-Chain Capital.
              </h1>
              <div className="flex max-w-2xl flex-col items-stretch gap-8 lg:items-end lg:gap-10 lg:text-right xl:max-w-3xl">
                <p className="text-lg leading-relaxed text-white/90 sm:text-xl lg:text-2xl">
                  A decentralized infrastructure for financing receivables and accessing yield from verified
                  off-chain transactions — securely and transparently.
                </p>
                <button
                  type="button"
                  onClick={goToApp}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-white px-10 py-4 text-base font-semibold text-[#0b1f3a] shadow-lg transition hover:bg-slate-100 sm:w-auto lg:self-end lg:text-lg"
                >
                  Go to app
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats (28px / 72px) → mission (45px, right) → COMMERCE (90% width, max 280px) */}
        <section
          className="relative mt-[80px] flex flex-col bg-white"
          aria-label="Platform overview"
        >
          <div className="mx-auto w-[90%]">
            <div
              className="grid grid-cols-2 md:grid-cols-4"
              aria-label="Platform statistics"
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={clsx(
                    'flex flex-col items-center justify-center px-3 py-10 text-center sm:px-6 sm:py-12 md:py-14',
                    (i === 0 || i === 2) && 'max-md:border-r max-md:border-slate-200',
                    i < 2 && 'max-md:border-b max-md:border-slate-200',
                    i < STATS.length - 1 && 'md:border-r md:border-slate-200'
                  )}
                >
                  <p className="text-[18px] font-medium leading-snug text-slate-600 sm:text-[22px] md:text-[28px]">
                    {s.label}
                  </p>
                  <p className="mt-2 text-[40px] font-bold leading-none text-blue-600 sm:text-[52px] md:text-[72px]">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="py-14 sm:py-16 lg:py-20">
              <p className="ml-auto max-w-5xl text-right text-[22px] font-normal leading-snug text-slate-900 sm:text-[32px] md:text-[45px] md:leading-snug">
                <span className="font-bold text-blue-900">Our mission</span>{' '}
                <span className="text-blue-900">
                  is to unlock global liquidity by{' '}
                  <strong className="font-semibold text-blue-800">
                    connecting real-world assets with digital capital
                  </strong>
                  , enabling businesses to access funding seamlessly{' '}
                </span>
                <span className="text-slate-400">
                  while providing investors with transparent, structured opportunities for yield.
                </span>
              </p>
            </div>
          </div>

          <div className="mx-auto w-[90%] overflow-hidden pb-10 pt-2 sm:pb-12 lg:pb-14">
            <p
              className="block w-full whitespace-nowrap text-center font-extralight uppercase leading-none tracking-[0.06em] text-sky-200/50"
              style={{ fontSize: 'min(23.33vw, 280px)' }}
              aria-hidden
            >
              COMMERCE
            </p>
          </div>
        </section>

        {/* Lending pool — product showcase (900px-tall reference artwork) */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-slate-100 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto w-[90%]">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
              <h2 className="max-w-lg text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:max-w-xl lg:text-5xl">
                Structured capital, deployed efficiently
              </h2>
              <div className="flex max-w-2xl flex-col gap-8 lg:items-end">
                <p className="text-lg leading-relaxed text-slate-600 sm:text-xl lg:text-right lg:text-2xl">
                  Capital flows into a unified lending pool, enabling seamless allocation into verified
                  receivables with transparent returns and defined terms.
                </p>
                <button
                  type="button"
                  onClick={goToApp}
                  className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-500 sm:w-auto lg:text-lg"
                >
                  {onboarded ? 'Go to app' : 'Get started'}
                </button>
              </div>
            </div>
            <div className="mt-14 flex h-[900px] w-full justify-center lg:mt-20">
              <img
                src={landingLendingPoolDashboard}
                alt="Dashboard mockup for Fist Commerce Lending Pool showing financial metrics like total deposited, liquid assets, and loan interest, with overlapping status cards for funded receivables and joining the pool."
                className="h-full w-[80vw] max-w-none object-contain object-center"
                decoding="async"
              />
            </div>
          </div>
        </section>

        {/* Merchants */}
        <section
          id="merchants"
          className="scroll-mt-24 flex min-h-[900px] flex-col justify-center py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto w-[90%]">
            <div className="mb-12 flex justify-center lg:mb-14">
              <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-blue-800">
                For merchants
              </span>
            </div>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
              <h2 className="max-w-lg text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:max-w-xl lg:text-5xl">
                Gain greater control over cash flow.
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl lg:text-right lg:text-2xl">
                Access working capital from outstanding invoices and maintain operational stability without
                traditional financing constraints.
              </p>
            </div>
            <ul className="mt-12 flex flex-col gap-4 sm:mt-14 sm:gap-5">
              {MERCHANT_BENEFITS.map((row) => (
                <li
                  key={row.text}
                  className={clsx(
                    'rounded-2xl px-6 py-5 text-base font-semibold text-white shadow-sm sm:px-8 sm:py-6 sm:text-lg lg:text-xl',
                    row.className
                  )}
                >
                  {row.n} {row.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Investors */}
        <section
          id="investors"
          className="scroll-mt-24 flex min-h-[900px] flex-col justify-center py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto w-[90%]">
            <div className="mb-12 flex justify-center lg:mb-14">
              <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-blue-800">
                For investors
              </span>
            </div>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
              <h2 className="max-w-lg text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:max-w-xl lg:text-5xl">
                Consistent access to structured returns.
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl lg:text-right lg:text-2xl">
                Participate in short-term, asset-backed opportunities with transparent terms and clearly defined
                outcomes.
              </p>
            </div>

            {/* Mobile: vertical accordion-style rows */}
            <div className="mt-12 flex flex-col gap-4 sm:mt-14 lg:hidden">
              {INVESTOR_ITEMS.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveInvestor(i)}
                  className={clsx(
                    'w-full rounded-2xl p-6 text-left text-white shadow-sm transition ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-white/50',
                    item.className,
                    activeInvestor === i ? 'ring-2 ring-white/60' : 'opacity-95'
                  )}
                >
                  <p className="text-lg font-semibold">{item.title}</p>
                  {activeInvestor === i && (
                    <p className="mt-4 text-base leading-relaxed text-white/95">{item.body}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Desktop: expanded panel + vertical tabs */}
            <div className="mt-12 hidden min-h-[380px] gap-4 lg:mt-14 lg:flex">
              <div
                className={clsx(
                  'flex flex-[1_1_68%] flex-col justify-center rounded-2xl p-10 text-white shadow-lg lg:p-12',
                  INVESTOR_ITEMS[activeInvestor].className
                )}
              >
                <h3 className="text-2xl font-bold lg:text-3xl">{INVESTOR_ITEMS[activeInvestor].title}</h3>
                <p className="mt-6 text-base leading-relaxed text-white/95 lg:text-lg">
                  {INVESTOR_ITEMS[activeInvestor].body}
                </p>
              </div>
              <div className="flex flex-[1_1_32%] gap-2">
                {[0, 1, 2, 3]
                  .filter((i) => i !== activeInvestor)
                  .map((i) => {
                    const item = INVESTOR_ITEMS[i]
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setActiveInvestor(i)}
                        className={clsx(
                          'relative min-h-[320px] flex-1 rounded-2xl transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
                          item.className
                        )}
                        aria-label={item.title}
                      >
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-1">
                          <span className="-rotate-90 whitespace-nowrap text-center text-sm font-bold uppercase tracking-wide text-white drop-shadow-sm">
                            {item.short}
                          </span>
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-24 flex min-h-[900px] flex-col justify-center border-t border-slate-100 py-16 sm:py-20"
        >
          <div className="mx-auto w-[90%]">
            <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">FAQs</h2>
            <div className="mt-12 space-y-4 sm:mt-14">
              {FAQS.map((f, i) => (
                <div key={f.q} className="rounded-2xl border border-slate-200 bg-slate-50/80">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-slate-900 sm:py-6 sm:text-lg"
                  >
                    {f.q}
                    <span className="shrink-0 text-xl text-slate-400" aria-hidden>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="border-t border-slate-200 px-6 pb-5 pt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                      {f.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer — bottom half of marketing layout */}
      <footer className="bg-[#060d18] text-white">
        <div className="mx-auto w-[90%] py-14 sm:py-16">
          <p className="text-sm font-medium text-sky-300/90">Contact us</p>
          <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Start participating in the future of finance
              </h2>
              <p className="mt-6 text-sm text-white/75">Email Us At:</p>
              <button
                type="button"
                onClick={copyEmail}
                className="mt-3 inline-flex w-fit max-w-full items-center gap-3 rounded-full bg-[#0e1f38] px-5 py-3 text-left text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-[#122a47] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
                aria-label={copied ? 'Email copied' : `Copy ${CONTACT_EMAIL} to clipboard`}
              >
                <span className="select-text text-sm">{CONTACT_EMAIL}</span>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white" aria-hidden>
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
              <div>
                <p className="text-sm font-semibold text-white/90">Pages</p>
                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  <li>
                    <a href="#top" className="transition hover:text-white">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="transition hover:text-white">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="transition hover:text-white">
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/90">Quick links</p>
                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  <li>
                    <Link to="/onboarding/investor/choose-role" className="transition hover:text-white">
                      Investor login
                    </Link>
                  </li>
                  <li>
                    <Link to="/onboarding/merchant/choose-role" className="transition hover:text-white">
                      Merchant login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex w-[90%] flex-row flex-wrap items-center justify-between gap-4 py-6">
            <p className="text-sm text-slate-600">
              © Fist Commerce 2026. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <FooterSocialLink href="https://www.facebook.com/" label="Facebook">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </FooterSocialLink>
              <FooterSocialLink href="https://www.linkedin.com/" label="LinkedIn">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </FooterSocialLink>
              <FooterSocialLink href="https://www.instagram.com/" label="Instagram">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </FooterSocialLink>
              <FooterSocialLink href="https://t.me/" label="Telegram">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </FooterSocialLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
