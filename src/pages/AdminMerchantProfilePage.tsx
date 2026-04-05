import { Navigate, useParams } from 'react-router-dom'

import { AdminMerchantProfileView } from '@/components/admin/merchants'
import { AdminPageFrame } from '@/components/admin/primitives'
import profileAvatarImage from '@/assets/Ellipse 5.png'
import { useAppSelector } from '@/store/hooks'
import { selectMerchantProfile } from '@/store/slices/adminMerchantsSlice'

const MERCHANTS_LIST_PATH = '/dashboard/admin/merchants'

const AdminMerchantProfilePage = () => {
  const { merchantId } = useParams<{ merchantId: string }>()
  const profile = useAppSelector((s) =>
    merchantId ? selectMerchantProfile(s.adminMerchants, merchantId) : null,
  )

  if (!profile || !merchantId) {
    return <Navigate to={MERCHANTS_LIST_PATH} replace />
  }

  return (
    <AdminPageFrame>
      <AdminMerchantProfileView avatarSrc={profileAvatarImage} profile={profile} />
    </AdminPageFrame>
  )
}

export default AdminMerchantProfilePage
