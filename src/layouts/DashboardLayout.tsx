import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardSideNav from '@/components/dashboard/investor/DashboardSideNav'
import DashboardTopBar, { type DashboardBreadcrumbItem } from '@/components/dashboard/investor/DashboardTopBar'

export type { DashboardBreadcrumbItem }

/** Root segment for side nav + internal dashboard links (merchant vs investor). */
export type DashboardBasePath = '/dashboard/merchant' | '/dashboard/investor'

interface DashboardLayoutProps {
  children: React.ReactNode
  /** Plain title when you are not using `topBarBreadcrumbs` */
  topBarTitle?: string
  /** Breadcrumb trail in the top bar (link tree). Takes precedence over `topBarTitle` when non-empty. */
  topBarBreadcrumbs?: DashboardBreadcrumbItem[]
  /** Which dashboard the user is in — drives side nav targets. Falls back to URL when omitted. */
  dashboardBasePath?: DashboardBasePath
  /** Investor pool detail: grey breadcrumb links instead of blue */
  topBarBreadcrumbLinksMuted?: boolean
  /** When set, header shows connected wallet chip instead of “Connect Wallet” */
  topBarWalletDisplay?: string
  /** Orange unread dot on notification bell */
  topBarNotificationUnread?: boolean
}

const DashboardLayout = ({
  children,
  topBarTitle,
  topBarBreadcrumbs,
  dashboardBasePath,
  topBarBreadcrumbLinksMuted,
  topBarWalletDisplay,
  topBarNotificationUnread,
}: DashboardLayoutProps) => {
  const { pathname } = useLocation()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  // Close the mobile nav overlay when the route changes.
  useEffect(() => {
    setIsNavOpen(false)
  }, [pathname])

  const menuButtonLabel = useMemo(
    () => (isNavOpen ? 'Close navigation menu' : 'Open navigation menu'),
    [isNavOpen],
  )

  // Some merchant flows (e.g. receivable detail "repay") may not pass `topBarWalletDisplay`.
  // Default to the demo wallet so the top bar shows the wallet chip instead of "Connect Wallet".
  const effectiveWalletDisplay =
    topBarWalletDisplay ??
    (dashboardBasePath === '/dashboard/merchant' ? '0x7A3F...92C1' : undefined)

  return (
    <main className="h-dvh w-full bg-[#EEF0F4] flex overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <DashboardSideNav
          basePath={dashboardBasePath}
          expanded={sidebarExpanded}
          onToggleExpanded={() => setSidebarExpanded((v) => !v)}
        />
      </div>

      {isNavOpen ? (
        <div className="lg:hidden fixed inset-0 z-60">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsNavOpen(false)} aria-hidden />
          <div className="absolute left-0 top-0 bottom-0">
            <DashboardSideNav
              basePath={dashboardBasePath}
              expanded
              onToggleExpanded={() => setSidebarExpanded((v) => !v)}
              onRequestClose={() => setIsNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          title={topBarTitle}
          breadcrumbs={topBarBreadcrumbs}
          breadcrumbLinksMuted={topBarBreadcrumbLinksMuted}
          walletDisplay={effectiveWalletDisplay}
          notificationUnread={topBarNotificationUnread}
          onMenuClick={() => setIsNavOpen((v) => !v)}
          menuButtonAriaLabel={menuButtonLabel}
        />

        <div className="px-4 sm:px-8 py-6 sm:py-8 overflow-y-auto flex-1 min-h-0">
          <div className="max-w-[1120px] mx-auto flex flex-col gap-4 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardLayout
