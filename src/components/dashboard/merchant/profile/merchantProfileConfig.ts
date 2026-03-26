import walletTabIcon from '@/assets/Icon (1).png'
import profileTabIcon from '@/assets/Icon.png'
import historyTabIcon from '@/assets/Icon (2).png'
import type {
  InvestorPortfolioMetric,
  InvestorProfileStat,
  InvestorProfileTab,
} from '@/components/dashboard/investor/profile/types'

export const MERCHANT_PROFILE = {
  name: 'Dre Andrew',
  email: 'besserasasocial@gmail.com',
}

export const MERCHANT_PROFILE_TABS: InvestorProfileTab[] = [
  { id: 'overview', label: 'Overview', to: 'overview', icon: profileTabIcon },
  { id: 'wallets', label: 'Wallets', to: 'wallets', icon: walletTabIcon },
  { id: 'history', label: 'Activities', to: 'history', icon: historyTabIcon },
]

export const MERCHANT_PROFILE_STATS: InvestorProfileStat[] = [
  {
    icon: 'money',
    title: 'Total Borrowed',
    subtitle: 'Amount borrowed from Lending Pool',
    primaryValue: '$24K',
    secondaryValue: '$24,000 USDT',
  },
  {
    icon: 'dollar',
    title: 'Total Repaid',
    subtitle: 'Amount repaid from loans',
    primaryValue: '$28,520K',
    secondaryValue: '$28,520 USDT',
    tone: 'positive',
  },
  {
    icon: 'money',
    title: 'Member Since',
    subtitle: 'Date Joined',
    primaryValue: 'Mar 2025',
    secondaryValue: '',
  },
]

export const MERCHANT_PORTFOLIO = {
  title: 'Portfolio Summary',
  poolName: 'Fist Commerce Pool',
  poolMeta: 'Moderate risk, Moderate returns.',
}

export const MERCHANT_PORTFOLIO_METRICS: InvestorPortfolioMetric[] = [
  { label: 'Total Deposited', value: '$340K', helper: '$340 USDT' },
  { label: 'Liquid Asset', value: '$120K', helper: '$340 USDT' },
  { label: 'Borrow APR', value: '5.3%', helper: 'To be repayed' },
  { label: 'Target Repayment Duration', value: '30-60 Days', helper: '' },
]
