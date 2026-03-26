import { Navigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import MerchantReceivableDetailContent from '@/components/dashboard/merchant/receivables/MerchantReceivableDetailContent'
import { getReceivableDetailById } from '@/components/dashboard/merchant/receivables/receivableDetailConfig'

const MerchantReceivableDetailPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const detail = receivableId ? getReceivableDetailById(receivableId) : null

  if (!detail || !receivableId) {
    return <Navigate to="/dashboard/merchant/receivables" replace />
  }

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'All Receivables', to: '/dashboard/merchant/receivables' },
    { label: 'View Receivable' },
  ]

  return (
    <DashboardLayout
      dashboardBasePath="/dashboard/merchant"
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay="0x7A3F...92C1"
      topBarNotificationUnread
    >
      <MerchantReceivableDetailContent detail={detail} />
    </DashboardLayout>
  )
}

export default MerchantReceivableDetailPage
