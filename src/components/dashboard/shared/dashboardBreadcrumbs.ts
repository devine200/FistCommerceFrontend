import type { DashboardBasePath, DashboardBreadcrumbItem } from './types'

/**
 * Breadcrumbs for the main dashboard shell (overview / opportunities / profile / merchant receivables).
 */
export function buildDashboardHomeBreadcrumbs(
  pathname: string,
  basePath: DashboardBasePath,
): DashboardBreadcrumbItem[] {
  const overviewTo = `${basePath}/overview`

  if (pathname.includes('/receivables')) {
    return [{ label: 'All Receivables' }]
  }
  if (pathname.includes('/opportunities')) {
    return [
      { label: 'Explore Lending Pools', to: overviewTo },
      { label: 'Opportunities' },
    ]
  }
  if (pathname.includes('/profile')) {
    return [
      { label: 'Explore Lending Pools', to: overviewTo },
      { label: 'Profile' },
    ]
  }
  return [{ label: 'Explore Lending Pools' }]
}

export function buildProfileOverviewBreadcrumbs(
  basePath: DashboardBasePath,
  pathname: string,
): DashboardBreadcrumbItem[] {
  const isWallets = pathname.endsWith('/wallets')
  const isHistory = pathname.endsWith('/history')
  const activeLabel = isWallets ? 'Wallets' : isHistory ? 'History' : 'Overview'

  return [
    { label: 'Profile', to: `${basePath}/profile/overview` },
    { label: activeLabel },
  ]
}
