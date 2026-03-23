import { useEffect, useState } from 'react'
import ConfirmDetailsModal from '@/components/dashboard/investor/ConfirmDetailsModal'
import KycVerificationCompleteModal from '@/components/dashboard/investor/KycVerificationCompleteModal'
import KycVerificationStepsModal from '@/components/dashboard/investor/KycVerificationStepsModal'
import VerifyIdentityModal from '@/components/dashboard/investor/VerifyIdentityModal'

interface KycVerificationModalProps {
  onClose: () => void
  totalSteps: number
}

enum KycModalView {
  VerificationSteps = 'verification_steps',
  ConfirmDetails = 'confirm_details',
  VerifyIdentity = 'verify_identity',
  Completed = 'completed',
}

const KycVerificationModal = ({
  onClose,
  totalSteps,
}: KycVerificationModalProps) => {
  const [activeView, setActiveView] = useState<KycModalView>(KycModalView.VerificationSteps)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const renderModalContent = () => {
    switch (activeView) {
      case KycModalView.ConfirmDetails:
        return <ConfirmDetailsModal onBack={onClose} onContinue={() => setActiveView(KycModalView.VerifyIdentity)} />
      case KycModalView.VerifyIdentity:
        return <VerifyIdentityModal onBack={onClose} onComplete={() => setActiveView(KycModalView.Completed)} />
      case KycModalView.Completed:
        return <KycVerificationCompleteModal onBackToDashboard={onClose} />
      case KycModalView.VerificationSteps:
      default:
        return (
          <KycVerificationStepsModal
            totalSteps={totalSteps}
            onConfirmDetailsClick={() => setActiveView(KycModalView.ConfirmDetails)}
            onVerifyIdentityClick={() => setActiveView(KycModalView.VerifyIdentity)}
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

export default KycVerificationModal

