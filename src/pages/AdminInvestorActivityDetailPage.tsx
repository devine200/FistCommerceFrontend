import { Navigate, useParams } from 'react-router-dom'

import { AdminPageFrame } from '@/components/admin/primitives'
import { AdminInvestmentDetailView } from '@/components/admin/investors/profile/AdminInvestmentDetailView'
import { useAppSelector } from '@/store/hooks'
import { selectInvestmentActivityDetail } from '@/store/slices/adminInvestorsSlice'

const INVESTORS_LIST_PATH = '/dashboard/admin/investors'

const AdminInvestorActivityDetailPage = () => {
  const { investorId, activityId } = useParams<{ investorId: string; activityId: string }>()
  const detail = useAppSelector((s) =>
    investorId && activityId
      ? selectInvestmentActivityDetail(s.adminInvestors, investorId, activityId)
      : null,
  )

  if (!investorId || !activityId) {
    return <Navigate to={INVESTORS_LIST_PATH} replace />
  }

  if (!detail) {
    return <Navigate to={`/dashboard/admin/investors/${investorId}`} replace />
  }

  return (
    <AdminPageFrame>
      <AdminInvestmentDetailView detail={detail} />
    </AdminPageFrame>
  )
}

export default AdminInvestorActivityDetailPage
