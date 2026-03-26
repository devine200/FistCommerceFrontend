import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import KycVerificationCard from '@/components/dashboard/investor/KycVerificationCard'
import WalletGateOpportunities from '@/components/dashboard/investor/WalletGateOpportunities'
import MerchantLendingPool from '@/components/dashboard/merchant/MerchantLendingPool'
import MerchantAllReceivablesContent from '@/components/dashboard/merchant/receivables/MerchantAllReceivablesContent'

const MerchantDashboardPage = () => {
  const { pathname } = useLocation()

  const topBarBreadcrumbs = useMemo((): DashboardBreadcrumbItem[] => {
    if (pathname.includes('/receivables')) {
      return [{ label: 'All Receivables' }]
    }
    if (pathname.includes('/opportunities')) {
      return [
        { label: 'Explore Lending Pools', to: '/dashboard/merchant/overview' },
        { label: 'Opportunities' },
      ]
    }
    if (pathname.includes('/profile')) {
      return [
        { label: 'Explore Lending Pools', to: '/dashboard/merchant/overview' },
        { label: 'Profile' },
      ]
    }
    return [{ label: 'Explore Lending Pools' }]
  }, [pathname])

  // Replace with real verification state from API/store when available.
  const isKycVerified = true

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay="0x7A3F...92C1"
    >
      {!isKycVerified && <KycVerificationCard variant="merchant" />}
      {isKycVerified ? (
        pathname.includes('/receivables') ? (
          <MerchantAllReceivablesContent />
        ) : (
          <MerchantLendingPool />
        )
      ) : (
        <WalletGateOpportunities />
      )}
    </DashboardLayout>
  )
}

export default MerchantDashboardPage
