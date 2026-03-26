import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { getSession } from '@/state/session'
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

const DefaultWagmiPage = () => {
  const connection = useConnection()
  const { connect, status, error } = useConnect()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()

  return (
    <>
      <div>
        <h2>Connection</h2>

        <div>
          status: {connection.status}
          <br />
          addresses: {JSON.stringify(connection.addresses)}
          <br />
          chainId: {connection.chainId}
        </div>

        {connection.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  ) 
}

const RootRedirect = () => {
  const s = getSession()
  if (!s.onboarded) return <Navigate to="/onboarding" replace />
  return <Navigate to={`/dashboard/${s.role}/overview`} replace />
}

const RequireOnboarded = ({ children }: { children: React.ReactNode }) => {
  const s = getSession()
  if (!s.onboarded) return <Navigate to={`/onboarding/${s.role}/choose-role`} replace />
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
    element: <RootRedirect />,
  },
  {
    path: '/wagmi-debug',
    element: <DefaultWagmiPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/onboarding/investor/choose-role" replace />,
      },
      {
        path: 'merchant',
        element: <MerchantLayout />,
        children: [
          {
            path: 'choose-role',
            element: <ChooseRole />
          },
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
            element: <Navigate to="choose-role" replace />,
          },
        ]
      },
      {
        path: 'investor',
        element: <InvestorLayout />,
        children: [
          {
            path: 'choose-role',
            element: <ChooseRole />
          },
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
            element: <Navigate to="choose-role" replace />,
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
            element: <InvestorInvestWithdrawPage />,
          },
          {
            path: 'lending-pool/:poolSlug/withdraw',
            element: <InvestorInvestWithdrawPage />,
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
            element: <Navigate to="overview" replace />,
          },
        ],
      },
      {
        path: 'merchant',
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
            element: <MerchantRepayLoanPage />,
          },
          {
            path: 'receivables/:receivableId/repay/confirm',
            element: <MerchantRepayLoanConfirmationPage />,
          },
          {
            path: 'receivables/:receivableId/repay/success',
            element: <MerchantRepayLoanSuccessPage />,
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
            element: <MerchantApplyLoanPage />,
          },
          {
            path: 'lending-pool/:poolSlug/apply-loan/success',
            element: <MerchantApplyLoanSuccessPage />,
          },
          {
            path: '*',
            element: <Navigate to="overview" replace />,
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
