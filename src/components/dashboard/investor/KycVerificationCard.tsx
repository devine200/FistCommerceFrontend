import kycIllustration from '@/assets/kyc_step_img.png'
import kycInProgressIllustration from '@/assets/kyc-inprogress.png'
import arrowIcon from '@/assets/arrow.png'
import { useEffect, useRef, useState } from 'react'

import InvestorKycVerificationModal from '@/components/dashboard/investor/InvestorKycVerificationModal'
import MerchantKycVerificationModal from '@/components/dashboard/merchant/MerchantKycVerificationModal'
import type { KycVerificationCardProps, KycVerificationCardVariant } from '@/components/dashboard/shared/types'
import { useAppSelector } from '@/store/hooks'
import { useActiveWallet } from '@/wallet/useActiveWallet'

export type { KycVerificationCardVariant }

function deriveCardState(
  variant: KycVerificationCardVariant,
  isConnected: boolean,
  investorRecord: { kyc_token?: string | null; kyc_verified?: boolean; insurance_verified?: boolean } | null,
  merchantRecord: { kyc_token?: string | null; kyc_verified?: boolean; insurance_verified?: boolean } | null,
) {
  if (variant === 'investor') {
    const hasStartedKyc = Boolean(investorRecord?.kyc_token && String(investorRecord.kyc_token).trim())
    if (hasStartedKyc) {
      return {
        hasStartedKyc: true,
        totalSteps: 1,
        currentStepNumber: 1,
        currentStepName: investorRecord?.kyc_verified ? 'Identity verified' : 'Identity verification',
      }
    }
    return {
      hasStartedKyc: false,
      totalSteps: 2,
      currentStepNumber: isConnected ? 2 : 1,
      currentStepName: isConnected ? 'Identity verification' : 'Connect Your Wallet',
    }
  }

  const hasStartedKyc = Boolean(merchantRecord?.kyc_token && String(merchantRecord.kyc_token).trim())
  if (hasStartedKyc) {
    const kv = Boolean(merchantRecord?.kyc_verified)
    const iv = Boolean(merchantRecord?.insurance_verified)
    let currentStepNumber = 1
    let currentStepName = 'Identity verification'
    if (kv && !iv) {
      currentStepNumber = 2
      currentStepName = 'Insurance verification'
    } else if (kv && iv) {
      currentStepNumber = 2
      currentStepName = 'Verification complete'
    }
    return {
      hasStartedKyc: true,
      totalSteps: 2,
      currentStepNumber,
      currentStepName,
    }
  }

  let currentStepNumber = 1
  let currentStepName = 'Connect Your Wallet'
  if (isConnected) {
    currentStepNumber = 2
    currentStepName = 'Identity verification'
    if (merchantRecord?.kyc_verified) {
      currentStepNumber = 3
      currentStepName = 'Insurance verification'
    }
  }
  return {
    hasStartedKyc: false,
    totalSteps: 3,
    currentStepNumber,
    currentStepName,
  }
}

const KycVerificationCard = ({
  variant = 'investor',
  hasStartedKyc: hasStartedKycProp,
  totalSteps: totalStepsProp,
  currentStepNumber: currentStepNumberProp,
  currentStepName: currentStepNameProp,
}: KycVerificationCardProps) => {
  const { isConnected } = useActiveWallet()
  const investorRecord = useAppSelector((s) => s.kyc.investorKycRecord)
  const merchantRecord = useAppSelector((s) => s.kyc.merchantKycRecord)

  const derived = deriveCardState(variant, isConnected, investorRecord, merchantRecord)

  const hasStartedKyc = hasStartedKycProp ?? derived.hasStartedKyc
  const safeTotalSteps = Math.max(1, totalStepsProp ?? derived.totalSteps)
  const safeCurrentStep = Math.min(
    Math.max(1, currentStepNumberProp ?? derived.currentStepNumber),
    safeTotalSteps,
  )
  const currentStepName = currentStepNameProp ?? derived.currentStepName

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
          <MerchantKycVerificationModal onClose={closeModal} />
        ) : (
          <InvestorKycVerificationModal onClose={closeModal} />
        ))}
    </>
  )
}

export default KycVerificationCard
