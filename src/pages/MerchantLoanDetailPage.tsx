import { Navigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import LendingPoolDetailPageContent from '@/components/dashboard/merchant/lending-pool-detail/LendingPoolDetailPageContent'
import { getLendingPoolDetailConfig } from '@/components/dashboard/merchant/lending-pool-detail/poolDetailConfig'

const MerchantLoanDetailPage = () => {
  const { poolSlug } = useParams<{ poolSlug: string }>()
  const config = getLendingPoolDetailConfig(poolSlug)

  if (!config) {
    return <Navigate to="/dashboard/merchant/overview" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Explore Lending Pools', to: '/dashboard/merchant/overview' },
    { label: 'Lending Pool' },
  ]

  return (
    <DashboardLayout dashboardBasePath="/dashboard/merchant" topBarBreadcrumbs={topBarBreadcrumbs}>
      <LendingPoolDetailPageContent config={config} />
    </DashboardLayout>
  )
}

export default MerchantLoanDetailPage
