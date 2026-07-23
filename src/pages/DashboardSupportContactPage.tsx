import { useLocation } from 'react-router-dom'

import { SupportContactContent } from '@/components/dashboard/shared/SupportContactContent'
import DashboardLayout, { type DashboardBreadcrumbItem } from '@/layouts/DashboardLayout'
import { useAppSelector } from '@/store/hooks'
import { selectInvestorWalletDisplay } from '@/store/selectors/investorDashboardSelectors'
import { selectMerchantWalletDisplay } from '@/store/selectors/merchantDashboardSelectors'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import { dashboardHomePath } from '@/utils/userRole'

const DashboardSupportContactPage = () => {
  const { pathname } = useLocation()
  const isMerchant = pathname.startsWith('/dashboard/merchant')
  const dashboardBasePath = isMerchant ? '/dashboard/merchant' : '/dashboard/investor'
  const isKycVerified = useAppSelector(selectIsKycVerified)
  const role = isMerchant ? 'merchant' : 'investor'
  const walletDisplay = useAppSelector(isMerchant ? selectMerchantWalletDisplay : selectInvestorWalletDisplay)

  const topBarBreadcrumbs: DashboardBreadcrumbItem[] = [
    { label: 'Dashboard', to: dashboardHomePath(role, isKycVerified) },
    { label: 'Support' },
  ]

  return (
    <DashboardLayout
      dashboardBasePath={dashboardBasePath}
      topBarBreadcrumbs={topBarBreadcrumbs}
      topBarWalletDisplay={walletDisplay}
    >
      <SupportContactContent />
    </DashboardLayout>
  )
}

export default DashboardSupportContactPage
