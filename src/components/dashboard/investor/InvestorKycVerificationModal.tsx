import { useEffect, useState } from 'react'

import ConfirmDetailsModal from '@/components/dashboard/investor/ConfirmDetailsModal'
import InvestorKycVerificationStepsModal from '@/components/dashboard/investor/InvestorKycVerificationStepsModal'
import KycVerificationCompleteModal from '@/components/dashboard/kyc/KycVerificationCompleteModal'
import VerifyIdentityModal from '@/components/dashboard/kyc/VerifyIdentityModal'
import { setKycVerified } from '@/state/session'

interface InvestorKycVerificationModalProps {
  onClose: () => void
  totalSteps: number
}

enum InvestorKycModalView {
  VerificationSteps = 'verification_steps',
  ConfirmDetails = 'confirm_details',
  VerifyIdentity = 'verify_identity',
  Completed = 'completed',
}

const InvestorKycVerificationModal = ({ onClose, totalSteps }: InvestorKycVerificationModalProps) => {
  const [activeView, setActiveView] = useState<InvestorKycModalView>(InvestorKycModalView.VerificationSteps)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const renderModalContent = () => {
    switch (activeView) {
      case InvestorKycModalView.ConfirmDetails:
        return (
          <ConfirmDetailsModal onBack={onClose} onContinue={() => setActiveView(InvestorKycModalView.VerifyIdentity)} />
        )
      case InvestorKycModalView.VerifyIdentity:
        return (
          <VerifyIdentityModal
            onBack={onClose}
            onComplete={() => setActiveView(InvestorKycModalView.Completed)}
          />
        )
      case InvestorKycModalView.Completed:
        return (
          <KycVerificationCompleteModal
            onBackToDashboard={() => {
              setKycVerified(true)
              onClose()
            }}
          />
        )
      case InvestorKycModalView.VerificationSteps:
      default:
        return (
          <InvestorKycVerificationStepsModal
            totalSteps={totalSteps}
            onConfirmDetailsClick={() => setActiveView(InvestorKycModalView.ConfirmDetails)}
            onVerifyIdentityClick={() => setActiveView(InvestorKycModalView.VerifyIdentity)}
          />
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-[920px] max-w-[95vw] bg-white rounded-[6px] border border-[#E6E8EC] px-10 py-[60px]">
        {renderModalContent()}
      </div>
    </div>
  )
}

export default InvestorKycVerificationModal
