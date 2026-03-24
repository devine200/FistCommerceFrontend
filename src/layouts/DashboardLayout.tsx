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
  return (
    <main className="h-screen w-full bg-[#EEF0F4] flex overflow-hidden">
      <DashboardSideNav basePath={dashboardBasePath} />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          title={topBarTitle}
          breadcrumbs={topBarBreadcrumbs}
          breadcrumbLinksMuted={topBarBreadcrumbLinksMuted}
          walletDisplay={topBarWalletDisplay}
          notificationUnread={topBarNotificationUnread}
        />

        <div className="px-8 py-8 overflow-y-auto flex-1 min-h-0">
          <div className="max-w-[1120px] mx-auto flex flex-col gap-4 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardLayout
