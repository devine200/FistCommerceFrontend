import DashboardLayout from '@/layouts/DashboardLayout'
import KycVerificationCard from '@/components/dashboard/investor/KycVerificationCard'
import WalletGateOpportunities from '@/components/dashboard/investor/WalletGateOpportunities'
import InvestorLendingPool from '@/components/dashboard/investor/InvestorLendingPool'

const DashboardPage = () => {
  // Replace with real verification state from API/store when available.
  const isKycVerified = false

  return (
    <DashboardLayout>
      {!isKycVerified && <KycVerificationCard />}
      {isKycVerified ? <InvestorLendingPool /> : <WalletGateOpportunities />}
    </DashboardLayout>
  )
}

export default DashboardPage