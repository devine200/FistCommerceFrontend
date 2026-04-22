import { Navigate, useParams } from 'react-router-dom'

import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import MerchantReceivableDetailContent from '@/components/dashboard/merchant/receivables/MerchantReceivableDetailContent'
import { getReceivableDetailById } from '@/components/dashboard/merchant/receivables/receivableDetailConfig'
import { useAppSelector } from '@/store/hooks'
import type { ReceivableDetailView } from '@/components/dashboard/merchant/receivables/receivableDetailTypes'
import { ReceivableStage } from '@/types/receivables'

const MerchantReceivableDetailPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const apiRow = useAppSelector((s) => s.merchantReceivables.rows.find((r) => r.id === receivableId))
  const demo = receivableId ? getReceivableDetailById(receivableId) : null

  const detail: ReceivableDetailView | null = apiRow
    ? {
        ...(demo ?? {}),
        row: apiRow,
        // Keep existing demo scaffolding until `GET /loan/details/{loan_id}/` is wired.
        subtitle: demo?.subtitle ?? 'Receivable details',
        heroMetrics: demo?.heroMetrics ?? [],
        lifecycle: demo?.lifecycle ?? [],
        repaymentRows: demo?.repaymentRows ?? [],
        maturityBanner: demo?.maturityBanner ?? '',
        basicInfo: demo?.basicInfo ?? [],
        documentName: demo?.documentName ?? '—',
        stage: demo?.stage ?? ReceivableStage.Verified,
        merchantId: demo?.merchantId ?? '—',
      }
    : demo

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
