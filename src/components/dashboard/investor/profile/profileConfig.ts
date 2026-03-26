import type {
  InvestorPortfolioMetric,
  InvestorProfileStat,
  InvestorProfileTab,
} from '@/components/dashboard/investor/profile/types'
import profileTabIcon from '@/assets/Icon.png'
import walletTabIcon from '@/assets/Icon (1).png'
import historyTabIcon from '@/assets/Icon (2).png'

export const INVESTOR_PROFILE = {
  name: 'Christopher Nolan',
  email: 'usersasocial@gmail.com',
}

export const INVESTOR_PROFILE_TABS: InvestorProfileTab[] = [
  { id: 'overview', label: 'Overview', to: 'overview', icon: profileTabIcon },
  { id: 'wallets', label: 'Wallets', to: 'wallets', icon: walletTabIcon },
  { id: 'history', label: 'History', to: 'history', icon: historyTabIcon },
]

export const INVESTOR_PROFILE_STATS: InvestorProfileStat[] = [
  {
    icon: 'money',
    title: 'Total Invested',
    subtitle: 'Amount Put in Lending Pool',
    primaryValue: '$24K',
    secondaryValue: '$24,000 USDT',
  },
  {
    icon: 'dollar',
    title: 'Total Earnings',
    subtitle: 'Interest earned from investments',
    primaryValue: '$4,520K',
    secondaryValue: '$4,520 USDT',
    tone: 'positive',
  },
  {
    icon: 'money',
    title: 'Member Since',
    subtitle: 'Date Joined',
    primaryValue: 'Nov 2025',
    secondaryValue: '',
  },
]

export const INVESTOR_PORTFOLIO = {
  title: 'Portfolio Summary',
  poolName: 'Fist Commerce Pool',
  poolMeta: 'Moderate risk, Moderate returns',
}

export const INVESTOR_PORTFOLIO_METRICS: InvestorPortfolioMetric[] = [
  { label: 'Total Deposited', value: '$340K', helper: '$340 USDT' },
  { label: 'Liquid Asset', value: '$120K', helper: '$340 USDT' },
  { label: 'Borrow APR', value: '5.3%', helper: 'To be repayed' },
  { label: 'Target Repayment Duration', value: '30-60 Days', helper: '' },
]
