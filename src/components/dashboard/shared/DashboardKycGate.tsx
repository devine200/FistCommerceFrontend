import KycVerificationCard from '@/components/dashboard/investor/KycVerificationCard'
import WalletGateOpportunities from '@/components/dashboard/investor/WalletGateOpportunities'

import type { DashboardKycGateProps } from './types'

const DashboardKycGate = ({ isKycVerified, kycVariant, verifiedContent }: DashboardKycGateProps) => {
  return (
    <>
      {!isKycVerified ? <KycVerificationCard variant={kycVariant} /> : null}
      {isKycVerified ? verifiedContent : <WalletGateOpportunities />}
    </>
  )
}

export default DashboardKycGate
