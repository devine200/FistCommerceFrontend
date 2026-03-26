export type InvestorProfileStat = {
  icon: 'money' | 'dollar'
  title: string
  subtitle: string
  primaryValue: string
  secondaryValue: string
  tone?: 'default' | 'positive'
}

export type InvestorProfileTab = {
  id: 'overview' | 'wallets' | 'history'
  label: string
  to: string
  icon: string
}

export type InvestorPortfolioMetric = {
  label: string
  value: string
  helper: string
}
