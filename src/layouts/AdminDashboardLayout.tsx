import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import AdminSideNav from '@/components/admin/AdminSideNav'
import AdminTopBar from '@/components/admin/AdminTopBar'

const TITLE_BY_SEGMENT: Record<string, string> = {
  overview: 'Platform Overview',
  receivables: 'Receivables Management',
  merchants: 'Merchants Management',
  investors: 'Investors Management',
  'loan-monitoring': 'Loan Monitoring',
  transactions: 'Transactions',
  settlements: 'Settlements',
  support: 'Support & Disputes',
  alerts: 'Notifications',
  settings: 'Settings',
}

const AdminDashboardLayout = () => {
  const { pathname } = useLocation()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const pageTitle = useMemo(() => {
    if (pathname.includes('/dashboard/admin/receivables/')) return TITLE_BY_SEGMENT.receivables
    const seg = pathname.split('/').filter(Boolean).pop() ?? 'overview'
    return TITLE_BY_SEGMENT[seg] ?? 'Admin'
  }, [pathname])

  const menuButtonLabel = mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'

  return (
    <main className="h-dvh w-full bg-[#EEF0F4] flex overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <AdminSideNav
          expanded={sidebarExpanded}
          onToggleExpanded={() => setSidebarExpanded((v) => !v)}
        />
      </div>

      {mobileNavOpen ? (
        <div className="lg:hidden fixed inset-0 z-60">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNavOpen(false)} aria-hidden />
          <div className="absolute left-0 top-0 bottom-0">
            <AdminSideNav
              expanded
              onToggleExpanded={() => setSidebarExpanded((v) => !v)}
              onRequestClose={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          title={pageTitle}
          notificationUnread
          walletDisplay="0x7A3F...92C1"
          onMenuClick={() => setMobileNavOpen((v) => !v)}
          menuButtonAriaLabel={menuButtonLabel}
        />

        <h1 className="lg:hidden shrink-0 px-4 sm:px-6 lg:px-8 pt-4 text-black font-semibold text-[18px] leading-tight">
          {pageTitle}
        </h1>

        <div className="px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

export default AdminDashboardLayout
