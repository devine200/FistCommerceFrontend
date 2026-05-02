import type { ReactNode } from 'react'

import InvestorDashboardSessionLayout from '@/components/session/InvestorDashboardSessionLayout'
import KycFinancialRoutesGuard from '@/components/session/KycFinancialRoutesGuard'
import MerchantDashboardSessionLayout from '@/components/session/MerchantDashboardSessionLayout'
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { useAppSelector } from '@/store/hooks'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import OnboardingPage from '@/pages/OnboardingPage'
import OnboardingCompleted, { OnboardingCompletedVariant } from '@/pages/OnboardingCompleted'
import MerchantLayout from '@/layouts/MerchantOnboardingLayout'
import InvestorLayout from '@/layouts/InvestorOnboardingLayout'

import ChooseRole from '@/components/onboarding/onboarding-steps/ChooseRole'
import ConnectWallet from '@/components/onboarding/onboarding-steps/ConnectWallet'
import InvestorRegistration from '@/components/onboarding/onboarding-steps/investor/InvestorRegistration'
import InvestmentExplainer from '@/components/onboarding/onboarding-steps/investor/InvestmentExplainer'
import MerchantIdVerification from '@/components/onboarding/onboarding-steps/merchant/MerchantIdVerification'
import BusinessProfile from '@/components/onboarding/onboarding-steps/merchant/BusinessProfileVerification'
import PageNotFound from '@/pages/404'
import DashboardPage from './pages/InvestorDashboardPage'
import MerchantDashboardPage from './pages/MerchantDashboardPage'
import MerchantLoanDetailPage from './pages/MerchantLoanDetailPage'
import InvestorLendingPoolDetailPage from './pages/InvestorLendingPoolDetailPage'
import InvestorLendingPoolHowItWorksPage from './pages/InvestorLendingPoolHowItWorksPage'
import InvestorInvestWithdrawPage from './pages/InvestorInvestWithdrawPage'
import InvestorProfileOverviewPage from './pages/InvestorProfileOverviewPage'
import InvestorProfileOverviewTabContent from '@/components/dashboard/investor/profile/InvestorProfileOverviewTabContent'
import InvestorProfileWalletsTabContent from '@/components/dashboard/investor/profile/InvestorProfileWalletsTabContent'
import InvestorProfileHistoryTabContent from '@/components/dashboard/investor/profile/InvestorProfileHistoryTabContent'
import MerchantProfileOverviewPage from '@/pages/MerchantProfileOverviewPage'
import MerchantProfileOverviewTabContent from '@/components/dashboard/merchant/profile/MerchantProfileOverviewTabContent'
import MerchantApplyLoanPage from './pages/MerchantApplyLoanPage'
import MerchantApplyLoanSuccessPage from './pages/MerchantApplyLoanSuccessPage'
import MerchantProfileActivitiesTabContent from '@/components/dashboard/merchant/profile/MerchantProfileActivitiesTabContent'
import MerchantReceivableDetailPage from '@/pages/MerchantReceivableDetailPage'
import MerchantRepayLoanPage from '@/pages/MerchantRepayLoanPage'
import MerchantRepayLoanConfirmationPage from '@/pages/MerchantRepayLoanConfirmationPage'
import MerchantRepayLoanSuccessPage from '@/pages/MerchantRepayLoanSuccessPage'
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout'
import AdminPlatformOverviewPage from '@/pages/AdminPlatformOverviewPage'
import AdminReceivablesManagementPage from '@/pages/AdminReceivablesManagementPage'
import AdminReceivableDetailPage from '@/pages/AdminReceivableDetailPage'
import AdminReceivableApprovedPage from '@/pages/AdminReceivableApprovedPage'
import AdminMerchantProfilePage from '@/pages/AdminMerchantProfilePage'
import AdminMerchantsManagementPage from '@/pages/AdminMerchantsManagementPage'
import AdminInvestorsManagementPage from '@/pages/AdminInvestorsManagementPage'
import AdminLoanMonitoringPage from '@/pages/AdminLoanMonitoringPage'
import AdminSectionPlaceholderPage from '@/pages/AdminSectionPlaceholderPage'
import AdminTransactionsPage from '@/pages/AdminTransactionsPage'
import AdminSettingsPage from '@/pages/AdminSettingsPage'
import AdminAlertsPage from '@/pages/AdminAlertsPage'
import AdminInvestorActivityDetailPage from '@/pages/AdminInvestorActivityDetailPage'
import AdminInvestorProfilePage from '@/pages/AdminInvestorProfilePage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import LandingPage from '@/pages/LandingPage'
import { parseUserRole } from '@/utils/userRole'

const RootRedirect = () => {
  const { onboarded, role, accessToken } = useAppSelector((s) => s.auth)
  const { isConnected } = useActiveWallet()
  const normalizedRole = parseUserRole(role)
  if (!onboarded) return <Navigate to="/onboarding" replace />
  if (!isConnected || !accessToken?.length) {
    if (!normalizedRole) return <Navigate to="/onboarding/choose-role" replace />
    return <Navigate to={`/onboarding/${normalizedRole}/connect-wallet`} replace />
  }
  if (!normalizedRole) return <Navigate to="/onboarding/choose-role" replace />
  return <Navigate to={`/dashboard/${normalizedRole}/overview`} replace />
}

const RequireOnboarded = ({ children }: { children: ReactNode }) => {
  const { onboarded } = useAppSelector((s) => s.auth)
  if (!onboarded) return <Navigate to="/onboarding/choose-role" replace />
  return <>{children}</>
}

const RequireOnboardedOutlet = () => (
  <RequireOnboarded>
    <Outlet />
  </RequireOnboarded>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/continue',
    element: <RootRedirect />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/onboarding/choose-role" replace />,
      },
      {
        path: 'choose-role',
        element: <InvestorLayout />,
        children: [{ index: true, element: <ChooseRole /> }],
      },
      {
        path: 'merchant',
        element: <MerchantLayout />,
        children: [
          {
            path: 'connect-wallet',
            element: <ConnectWallet />
          },
          {
            path: 'verify-identity',
            element: <MerchantIdVerification />
          },
          {
            path: 'business-profile',
            element: <BusinessProfile />
          },
          {
            path: '*',
            element: <Navigate to="/onboarding/choose-role" replace />,
          },
        ]
      },
      {
        path: 'investor',
        element: <InvestorLayout />,
        children: [
          {
            path: 'connect-wallet',
            element: <ConnectWallet />
          },
          {
            path: 'verify-identity',
            element: <InvestorRegistration />
          },
          {
            path: 'investment-explainer',
            element: <InvestmentExplainer />
          },
          {
            path: '*',
            element: <Navigate to="/onboarding/choose-role" replace />,
          },
        ]
      },
      {
        path: '*',
        element: <PageNotFound />,
      }
    ]
  },
  {
    path: '/onboarding-completed',
    children: [
      {
        index: true,
        element: <Navigate to="investor" replace />,
      },
      {
        path: 'investor',
        element: <OnboardingCompleted variant={OnboardingCompletedVariant.Investor} />,
      },
      {
        path: 'merchant',
        element: <OnboardingCompleted variant={OnboardingCompletedVariant.Merchant} />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <RequireOnboardedOutlet />,
    children: [
      {
        index: true,
        element: <Navigate to="investor" replace />,
      },
      {
        path: 'investor',
        element: <InvestorDashboardSessionLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: 'overview',
            element: <DashboardPage />,
          },
          {
            path: 'opportunities',
            element: <DashboardPage />,
          },
          {
            path: 'profile',
            element: <InvestorProfileOverviewPage />,
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: <InvestorProfileOverviewTabContent />,
              },
              {
                path: 'wallets',
                element: <InvestorProfileWalletsTabContent />,
              },
              {
                path: 'history',
                element: <InvestorProfileHistoryTabContent />,
              },
            ],
          },
          {
            path: 'lending-pool/:poolSlug/how-it-works',
            element: <InvestorLendingPoolHowItWorksPage />,
          },
          {
            path: 'lending-pool/:poolSlug/invest',
            element: (
              <KycFinancialRoutesGuard>
                <InvestorInvestWithdrawPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: 'lending-pool/:poolSlug/withdraw',
            element: (
              <KycFinancialRoutesGuard>
                <InvestorInvestWithdrawPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: 'lending-pool/:poolSlug/invest-withdraw',
            element: <Navigate to="../invest" replace />,
          },
          {
            path: 'lending-pool/:poolSlug',
            element: <InvestorLendingPoolDetailPage />,
          },
          {
            path: '*',
            element: <Navigate to="/dashboard/investor/overview" replace />,
          },
        ],
      },
      {
        path: 'admin',
        element: <Outlet />,
        children: [
          {
            path: 'login',
            element: <AdminLoginPage />,
          },
          {
            element: <AdminDashboardLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: <AdminPlatformOverviewPage />,
              },
              {
                path: 'receivables',
                element: <AdminReceivablesManagementPage />,
              },
              {
                path: 'receivables/:receivableId',
                element: <AdminReceivableDetailPage />,
              },
              {
                path: 'receivables/:receivableId/approved',
                element: <AdminReceivableApprovedPage />,
              },
              {
                path: 'merchants/:merchantId',
                element: <AdminMerchantProfilePage />,
              },
              {
                path: 'merchants',
                element: <AdminMerchantsManagementPage />,
              },
              {
                path: 'investors/:investorId/activity/:activityId',
                element: <AdminInvestorActivityDetailPage />,
              },
              {
                path: 'investors/:investorId',
                element: <AdminInvestorProfilePage />,
              },
              {
                path: 'investors',
                element: <AdminInvestorsManagementPage />,
              },
              {
                path: 'loan-monitoring',
                element: <AdminLoanMonitoringPage />,
              },
              {
                path: 'transactions',
                element: <AdminTransactionsPage />,
              },
              {
                path: 'settlements',
                element: <AdminSectionPlaceholderPage title="Settlements" />,
              },
              {
                path: 'support',
                element: <AdminSectionPlaceholderPage title="Support & Disputes" />,
              },
              {
                path: 'alerts',
                element: <AdminAlertsPage />,
              },
              {
                path: 'settings',
                element: <AdminSettingsPage />,
              },
              {
                path: '*',
                element: <Navigate to="/dashboard/admin/overview" replace />,
              },
            ],
          },
        ],
      },
      {
        path: 'merchant',
        element: <MerchantDashboardSessionLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: 'overview',
            element: <MerchantDashboardPage />,
          },
          {
            path: 'opportunities',
            element: <MerchantDashboardPage />,
          },
          {
            path: 'receivables/:receivableId/repay',
            element: (
              <KycFinancialRoutesGuard>
                <MerchantRepayLoanPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: 'receivables/:receivableId/repay/confirm',
            element: (
              <KycFinancialRoutesGuard>
                <MerchantRepayLoanConfirmationPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: 'receivables/:receivableId/repay/success',
            element: (
              <KycFinancialRoutesGuard>
                <MerchantRepayLoanSuccessPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: 'receivables/:receivableId',
            element: <MerchantReceivableDetailPage />,
          },
          {
            path: 'receivables',
            element: <MerchantDashboardPage />,
          },
          {
            path: 'profile',
            element: <MerchantProfileOverviewPage />,
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: <MerchantProfileOverviewTabContent />,
              },
              {
                path: 'wallets',
                element: <InvestorProfileWalletsTabContent />,
              },
              {
                path: 'history',
                element: <MerchantProfileActivitiesTabContent />,
              },
            ],
          },
          {
            path: 'lending-pool/:poolSlug',
            element: <MerchantLoanDetailPage />,
          },
          {
            path: 'lending-pool/:poolSlug/apply-loan',
            element: (
              <KycFinancialRoutesGuard>
                <MerchantApplyLoanPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: 'lending-pool/:poolSlug/apply-loan/success',
            element: (
              <KycFinancialRoutesGuard>
                <MerchantApplyLoanSuccessPage />
              </KycFinancialRoutesGuard>
            ),
          },
          {
            path: '*',
            element: <Navigate to="/dashboard/merchant/overview" replace />,
          },
        ],
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
