import kycIllustration from '@/assets/kyc_step_img.png'
import kycInProgressIllustration from '@/assets/kyc-inprogress.png'
import arrowIcon from '@/assets/arrow.png'
import { useEffect, useRef, useState } from 'react'

import KycVerificationModal from '@/components/dashboard/investor/KycVerificationModal'

interface KycVerificationCardProps {
  hasStartedKyc?: boolean
  totalSteps?: number
  currentStepNumber?: number
  currentStepName?: string
}

const KycVerificationCard = ({
  hasStartedKyc = false,
  totalSteps = 3,
  currentStepNumber = 1,
  currentStepName = 'Document Upload',
}: KycVerificationCardProps) => {
  const safeTotalSteps = Math.max(1, totalSteps)
  const safeCurrentStep = Math.min(Math.max(1, currentStepNumber), safeTotalSteps)

  const subtitle = hasStartedKyc
    ? `Step ${safeCurrentStep}/${safeTotalSteps} • ${currentStepName}`
    : 'Complete your registration and unlock multiple features on Fist Commerce'

  const illustrationSrc = hasStartedKyc ? kycInProgressIllustration : kycIllustration

  const [isModalOpen, setIsModalOpen] = useState(false)
  const didPushRef = useRef(false)

  useEffect(() => {
    if (!isModalOpen) return

    const onPopState = () => {
      didPushRef.current = false
      setIsModalOpen(false)
    }

    window.addEventListener('popstate', onPopState)
    if (!didPushRef.current) {
      didPushRef.current = true
      window.history.pushState({ kycModal: true }, '')
    }

    return () => window.removeEventListener('popstate', onPopState)
  }, [isModalOpen])

  const closeModal = () => {
    setIsModalOpen(false)
    if (didPushRef.current) {
      didPushRef.current = false
      window.history.back()
    }
  }

  return (
    <>
      <section className="bg-white border border-[#DFE2E8] rounded-[6px] px-8 py-6 h-[240px] flex items-center gap-10">
        <img
          src={illustrationSrc}
          alt="kyc verification"
          className="w-[200px] h-[200px] object-contain"
        />

        <div className="flex flex-col gap-1">
          <h2 className="text-black font-bold text-[40px] leading-tight">
            {hasStartedKyc ? 'KYC Verification in Progress' : 'Start Your KYC Verification'}
          </h2>
          <p className="text-[#6B7488] text-[24px]">{subtitle}</p>

          <button
            type="button"
            className="mt-2 bg-[#195EBC] text-white px-4 py-2 rounded-[4px] w-fit text-[24px] leading-none flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <span>{hasStartedKyc ? 'View Progress' : 'Begin Verification'}</span>
            <img src={arrowIcon} alt="arrow icon" className="w-[20px] h-[20px] object-contain" />
          </button>
        </div>
      </section>

      {isModalOpen && (
        <KycVerificationModal
          onClose={closeModal}
          totalSteps={safeTotalSteps}
        />
      )}
    </>
  )
}

export default KycVerificationCard
