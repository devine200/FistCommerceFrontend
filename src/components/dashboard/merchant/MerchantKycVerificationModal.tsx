import { useEffect, useState } from 'react'

import KycVerificationCompleteModal from '@/components/dashboard/kyc/KycVerificationCompleteModal'
import VerifyIdentityModal from '@/components/dashboard/kyc/VerifyIdentityModal'
import MerchantConfirmDetailsModal from '@/components/dashboard/merchant/MerchantConfirmDetailsModal'
import MerchantKycVerificationStepsModal from '@/components/dashboard/merchant/MerchantKycVerificationStepsModal'
import UploadBusinessDocumentsModal from '@/components/dashboard/merchant/UploadBusinessDocumentsModal'

interface MerchantKycVerificationModalProps {
  onClose: () => void
  totalSteps: number
}

enum MerchantKycModalView {
  VerificationSteps = 'verification_steps',
  ConfirmDetails = 'confirm_details',
  VerifyIdentity = 'verify_identity',
  UploadBusinessDocuments = 'upload_business_documents',
  Completed = 'completed',
}

/**
 * Merchant KYC: confirm → verify identity → upload business docs → success.
 * Success screen uses the same `KycVerificationCompleteModal` as the investor flow.
 */
const MerchantKycVerificationModal = ({ onClose, totalSteps }: MerchantKycVerificationModalProps) => {
  const [activeView, setActiveView] = useState<MerchantKycModalView>(MerchantKycModalView.VerificationSteps)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const renderModalContent = () => {
    switch (activeView) {
      case MerchantKycModalView.ConfirmDetails:
        return (
          <MerchantConfirmDetailsModal
            onBack={onClose}
            onContinue={() => setActiveView(MerchantKycModalView.VerifyIdentity)}
          />
        )
      case MerchantKycModalView.VerifyIdentity:
        return (
          <VerifyIdentityModal
            onBack={onClose}
            onComplete={() => setActiveView(MerchantKycModalView.UploadBusinessDocuments)}
          />
        )
      case MerchantKycModalView.UploadBusinessDocuments:
        return (
          <UploadBusinessDocumentsModal onBack={onClose} onComplete={() => setActiveView(MerchantKycModalView.Completed)} />
        )
      case MerchantKycModalView.Completed:
        return <KycVerificationCompleteModal onBackToDashboard={onClose} />
      case MerchantKycModalView.VerificationSteps:
      default:
        return (
          <MerchantKycVerificationStepsModal
            totalSteps={totalSteps}
            onConfirmDetailsClick={() => setActiveView(MerchantKycModalView.ConfirmDetails)}
            onVerifyIdentityClick={() => setActiveView(MerchantKycModalView.VerifyIdentity)}
            onUploadBusinessDocumentsClick={() => setActiveView(MerchantKycModalView.UploadBusinessDocuments)}
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

export default MerchantKycVerificationModal
