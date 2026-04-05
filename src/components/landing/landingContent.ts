import type {
  LandingFaqItem,
  LandingFooterColumn,
  LandingInvestorPanelItem,
  LandingMerchantBenefitItem,
  LandingStatItem,
} from '@/components/landing/types'

export const LANDING_STATS: LandingStatItem[] = [
  { label: 'Receivables Processed', value: '$240k+' },
  { label: 'Avg Funding Time', value: '<48 Hours' },
  { label: 'Average Returns', value: '4-12%' },
  { label: 'Verified Transactions', value: '100%' },
]

export const LANDING_MERCHANT_BENEFITS: LandingMerchantBenefitItem[] = [
  { id: 'm1', prefix: '1.', text: 'Faster access to capital', toneClassName: 'bg-blue-600' },
  { id: 'm2', prefix: '2.', text: 'Improved cash flow management', toneClassName: 'bg-lime-500' },
  { id: 'm3', prefix: '3.', text: 'No traditional debt burden', toneClassName: 'bg-fuchsia-600' },
  { id: 'm4', prefix: '4.', text: 'Simple, transparent process', toneClassName: 'bg-orange-500' },
]

export const LANDING_INVESTOR_PANELS: LandingInvestorPanelItem[] = [
  {
    id: 'i1',
    short: 'Real-world yield',
    title: '1. Access to real-world yield',
    body: 'Earn returns backed by verified, asset-backed receivables generated from actual business transactions. Each opportunity is tied to real invoices and underlying commercial activity, providing a more tangible and transparent source of yield compared to purely speculative assets.',
    toneClassName: 'bg-blue-600',
  },
  {
    id: 'i2',
    short: 'Short-duration opportunities',
    title: '2. Short-duration investment opportunities',
    body: 'Deploy capital into short-horizon, structured placements with clear timelines and defined cash flow expectations—designed for investors who value liquidity planning alongside yield.',
    toneClassName: 'bg-lime-500',
  },
  {
    id: 'i3',
    short: 'Transparent risk & return',
    title: '3. Transparent risk & return structure',
    body: 'Terms, collateral context, and repayment mechanics are presented upfront so you can evaluate each opportunity on its merits—with fewer surprises and more clarity.',
    toneClassName: 'bg-fuchsia-600',
  },
  {
    id: 'i4',
    short: 'Diversified exposure',
    title: '4. Diversified exposure',
    body: 'Participate across a pipeline of verified receivables and merchant programs to spread exposure while staying inside a consistent underwriting framework.',
    toneClassName: 'bg-orange-500',
  },
]

export const LANDING_FAQS: LandingFaqItem[] = [
  {
    id: 'faq1',
    question: 'What is Fist Commerce?',
    answer:
      'Fist Commerce connects real-world receivables with on-chain capital—helping businesses access funding while giving investors transparent, structured opportunities.',
  },
  {
    id: 'faq2',
    question: 'How does onboarding work?',
    answer:
      'Choose whether you are a merchant or investor, connect a wallet, and complete the guided steps. You can start from the “Get funding” or “Start investing” actions in the top bar.',
  },
  {
    id: 'faq3',
    question: 'Is my capital at risk?',
    answer:
      'All financing involves risk. Opportunities are presented with defined terms, but outcomes depend on borrower performance and market conditions. Review each opportunity carefully.',
  },
]

export const LANDING_CONTACT_EMAIL = 'hey@fistcommerce@gmail.com'

export const LANDING_FOOTER_COLUMNS: LandingFooterColumn[] = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', href: '#top', variant: 'hash' },
      { label: 'How it works', href: '#how-it-works', variant: 'hash' },
      { label: 'FAQs', href: '#faq', variant: 'hash' },
    ],
  },
  {
    title: 'Quick links',
    links: [
      { label: 'Investor login', to: '/onboarding/investor/choose-role', variant: 'route' },
      { label: 'Merchant login', to: '/onboarding/merchant/choose-role', variant: 'route' },
    ],
  },
]
