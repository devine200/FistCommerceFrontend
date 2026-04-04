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
  const [completedStepIds, setCompletedStepIds] = useState<string[]>(['connect-wallet'])

  const markDone = (id: string) => {
    setCompletedStepIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const allDone = ['connect-wallet', 'confirm-details', 'verify-identity'].every((id) => completedStepIds.includes(id))

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
          <ConfirmDetailsModal
            onBack={() => setActiveView(InvestorKycModalView.VerificationSteps)}
            onContinue={() => {
              markDone('confirm-details')
              setActiveView(InvestorKycModalView.VerificationSteps)
            }}
          />
        )
      case InvestorKycModalView.VerifyIdentity:
        return (
          <VerifyIdentityModal
            onBack={() => setActiveView(InvestorKycModalView.VerificationSteps)}
            onComplete={() => {
              markDone('verify-identity')
              setActiveView(InvestorKycModalView.VerificationSteps)
            }}
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
            completedStepIds={completedStepIds}
            onConfirmDetailsClick={() => setActiveView(InvestorKycModalView.ConfirmDetails)}
            onVerifyIdentityClick={() => setActiveView(InvestorKycModalView.VerifyIdentity)}
          />
        )
    }
  }

  useEffect(() => {
    if (!allDone) return
    setActiveView(InvestorKycModalView.Completed)
  }, [allDone])

  return (
    <div
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-[2px] p-0 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full sm:w-[920px] sm:max-w-[95vw] bg-white rounded-t-[14px] sm:rounded-[6px] border border-[#E6E8EC] px-4 sm:px-10 py-5 sm:py-[60px] max-h-[85dvh] overflow-y-auto">
        {renderModalContent()}
      </div>
    </div>
  )
}

export default InvestorKycVerificationModal
