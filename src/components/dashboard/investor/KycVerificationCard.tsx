import kycIllustration from '@/assets/kyc_step_img.png'
import kycInProgressIllustration from '@/assets/kyc-inprogress.png'
import arrowIcon from '@/assets/arrow.png'
import { useEffect, useRef, useState } from 'react'

import InvestorKycVerificationModal from '@/components/dashboard/investor/InvestorKycVerificationModal'
import MerchantKycVerificationModal from '@/components/dashboard/merchant/MerchantKycVerificationModal'
import type { KycVerificationCardProps, KycVerificationCardVariant } from '@/components/dashboard/shared/types'

export type { KycVerificationCardVariant }

const KycVerificationCard = ({
  variant = 'investor',
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
      <section className="bg-white border border-[#DFE2E8] rounded-[6px] px-5 sm:px-8 py-6 h-auto lg:h-[240px] flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-10">
        <img
          src={illustrationSrc}
          alt="kyc verification"
          className="w-full max-w-[260px] h-[180px] sm:h-[200px] object-contain mx-auto lg:mx-0"
        />

        <div className="flex flex-col gap-1 w-full">
          <h2 className="text-black font-bold text-[24px] sm:text-[28px] lg:text-[40px] leading-tight text-center lg:text-left">
            {hasStartedKyc ? 'KYC Verification in Progress' : 'Start Your KYC Verification'}
          </h2>
          <p className="text-[#6B7488] text-[14px] sm:text-[16px] lg:text-[24px] text-center lg:text-left">
            {subtitle}
          </p>

          <button
            type="button"
            className="mt-4 lg:mt-2 bg-[#195EBC] text-white px-4 py-4 lg:py-4 rounded-[4px] w-full lg:w-fit text-[14px] sm:text-[16px] lg:text-[20px] leading-none flex items-center justify-center lg:justify-start gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <span>{hasStartedKyc ? 'View Progress' : 'Begin Verification'}</span>
            <img src={arrowIcon} alt="arrow icon" className="w-[20px] h-[20px] object-contain" />
          </button>
        </div>
      </section>

      {isModalOpen &&
        (variant === 'merchant' ? (
          <MerchantKycVerificationModal onClose={closeModal} totalSteps={safeTotalSteps} />
        ) : (
          <InvestorKycVerificationModal onClose={closeModal} totalSteps={safeTotalSteps} />
        ))}
    </>
  )
}

export default KycVerificationCard
