import walletTabIcon from '@/assets/Icon (1).png'
import profileTabIcon from '@/assets/Icon.png'
import historyTabIcon from '@/assets/Icon (2).png'
import { displayDashboardCompactUsd } from '@/api/metrics'
import type { MerchantMetrics, PoolMetrics } from '@/api/metrics'
import type {
  InvestorPortfolioMetric,
  InvestorProfileStat,
  InvestorProfileTab,
} from '@/components/dashboard/investor/profile/types'

export const MERCHANT_PROFILE_TABS: InvestorProfileTab[] = [
  { id: 'overview', label: 'Overview', to: 'overview', icon: profileTabIcon },
  { id: 'wallets', label: 'Wallets', to: 'wallets', icon: walletTabIcon },
  { id: 'history', label: 'Activities', to: 'history', icon: historyTabIcon },
]

export function buildMerchantProfileStatsFromApi(merchantMetrics: MerchantMetrics | null): InvestorProfileStat[] {
  const totalBorrowed = merchantMetrics ? displayDashboardCompactUsd(merchantMetrics.credit.totalBorrowed) : '$--'
  const totalRepaid = merchantMetrics ? displayDashboardCompactUsd(merchantMetrics.performance.totalRepaid) : '$--'
  const activeLoans = merchantMetrics ? String(merchantMetrics.credit.activeLoans) : '--'

  return [
    {
      icon: 'money',
      title: 'Total Borrowed',
      subtitle: 'Amount borrowed from Lending Pool',
      primaryValue: totalBorrowed,
      secondaryValue: '',
    },
    {
      icon: 'dollar',
      title: 'Total Repaid',
      subtitle: 'Amount repaid from loans',
      primaryValue: totalRepaid,
      secondaryValue: '',
      tone: 'positive',
    },
    {
      icon: 'money',
      title: 'Active Loans',
      subtitle: 'Currently outstanding facilities',
      primaryValue: activeLoans,
      secondaryValue: '',
    },
  ]
}

export const MERCHANT_PORTFOLIO = {
  title: 'Portfolio Summary',
  poolName: 'Fist Commerce Pool',
  poolMeta: 'Moderate risk, Moderate returns.',
}

export function buildMerchantPortfolioMetricsFromApi(
  merchantMetrics: MerchantMetrics | null,
  poolMetrics: PoolMetrics | null,
): InvestorPortfolioMetric[] {
  return [
    {
      label: 'Total Pool Size',
      value: poolMetrics ? displayDashboardCompactUsd(poolMetrics.tvl) : '$--',
      helper: '',
    },
    {
      label: 'Available Liquidity',
      value: poolMetrics ? displayDashboardCompactUsd(poolMetrics.availableLiquidity) : '$--',
      helper: '',
    },
    {
      label: 'Total Borrowed',
      value: merchantMetrics ? displayDashboardCompactUsd(merchantMetrics.credit.totalBorrowed) : '$--',
      helper: '',
    },
    {
      label: 'Total Repaid',
      value: merchantMetrics ? displayDashboardCompactUsd(merchantMetrics.performance.totalRepaid) : '$--',
      helper: '',
    },
  ]
}
