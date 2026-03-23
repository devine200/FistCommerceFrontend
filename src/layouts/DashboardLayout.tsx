import DashboardSideNav from '@/components/dashboard/investor/DashboardSideNav'
import DashboardTopBar from '@/components/dashboard/investor/DashboardTopBar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({children}: DashboardLayoutProps) => {
  return (
    <main className="h-screen w-full bg-[#EEF0F4] flex overflow-hidden">
      <DashboardSideNav />

      <div className="flex-1 flex flex-col">
        <DashboardTopBar />

        <div className="px-8 py-8 overflow-y-auto">
          <div className="max-w-[1120px] mx-auto flex flex-col gap-4">
              {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardLayout
