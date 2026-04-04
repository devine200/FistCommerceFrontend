import { useEffect, useState } from 'react'

import KycVerificationCompleteModal from '@/components/dashboard/kyc/KycVerificationCompleteModal'
import VerifyIdentityModal from '@/components/dashboard/kyc/VerifyIdentityModal'
import MerchantConfirmDetailsModal from '@/components/dashboard/merchant/MerchantConfirmDetailsModal'
import MerchantKycVerificationStepsModal from '@/components/dashboard/merchant/MerchantKycVerificationStepsModal'
import UploadBusinessDocumentsModal from '@/components/dashboard/merchant/UploadBusinessDocumentsModal'
import { setKycVerified } from '@/state/session'

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
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([])

  const markDone = (id: string) => {
    setCompletedStepIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const required = ['confirm-details', 'verify-identity', 'upload-business-documents']
  const allDone = required.every((id) => completedStepIds.includes(id))

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
            onBack={() => setActiveView(MerchantKycModalView.VerificationSteps)}
            onContinue={() => {
              markDone('confirm-details')
              setActiveView(MerchantKycModalView.VerificationSteps)
            }}
          />
        )
      case MerchantKycModalView.VerifyIdentity:
        return (
          <VerifyIdentityModal
            onBack={() => setActiveView(MerchantKycModalView.VerificationSteps)}
            onComplete={() => {
              markDone('verify-identity')
              setActiveView(MerchantKycModalView.VerificationSteps)
            }}
          />
        )
      case MerchantKycModalView.UploadBusinessDocuments:
        return (
          <UploadBusinessDocumentsModal
            onBack={() => setActiveView(MerchantKycModalView.VerificationSteps)}
            onComplete={() => {
              markDone('upload-business-documents')
              setActiveView(MerchantKycModalView.VerificationSteps)
            }}
          />
        )
      case MerchantKycModalView.Completed:
        return (
          <KycVerificationCompleteModal
            onBackToDashboard={() => {
              setKycVerified(true)
              onClose()
            }}
          />
        )
      case MerchantKycModalView.VerificationSteps:
      default:
        return (
          <MerchantKycVerificationStepsModal
            totalSteps={totalSteps}
            completedStepIds={completedStepIds}
            onConfirmDetailsClick={() => setActiveView(MerchantKycModalView.ConfirmDetails)}
            onVerifyIdentityClick={() => setActiveView(MerchantKycModalView.VerifyIdentity)}
            onUploadBusinessDocumentsClick={() => setActiveView(MerchantKycModalView.UploadBusinessDocuments)}
          />
        )
    }
  }

  useEffect(() => {
    if (!allDone) return
    setActiveView(MerchantKycModalView.Completed)
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

export default MerchantKycVerificationModal
