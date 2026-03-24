import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import KycVerificationCard from '@/components/dashboard/investor/KycVerificationCard'
import WalletGateOpportunities from '@/components/dashboard/investor/WalletGateOpportunities'
import InvestorLendingPool from '@/components/dashboard/investor/InvestorLendingPool'

const DashboardPage = () => {
  const { pathname } = useLocation()

  const topBarBreadcrumbs = useMemo((): DashboardBreadcrumbItem[] => {
    if (pathname.includes('/opportunities')) {
      return [
        { label: 'Explore Lending Pools', to: '/dashboard/investor/overview' },
        { label: 'Opportunities' },
      ]
    }
    if (pathname.includes('/profile')) {
      return [
        { label: 'Explore Lending Pools', to: '/dashboard/investor/overview' },
        { label: 'Profile' },
      ]
    }
    return [{ label: 'Explore Lending Pools' }]
  }, [pathname])

  // Replace with real verification state from API/store when available.
  const isKycVerified = true

  return (
    <DashboardLayout dashboardBasePath="/dashboard/investor" topBarBreadcrumbs={topBarBreadcrumbs}>
      {!isKycVerified && <KycVerificationCard />}
      {isKycVerified ? <InvestorLendingPool /> : <WalletGateOpportunities />}
    </DashboardLayout>
  )
}

export default DashboardPage
