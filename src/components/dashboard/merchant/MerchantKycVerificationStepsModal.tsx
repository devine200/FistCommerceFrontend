import Frame1 from '@/assets/Frame (1).png'
import Frame2 from '@/assets/Frame (2).png'
import uploadBusinessDocumentsIcon from '@/assets/case.png'

import { KycArrowRightIcon, KycCheckIcon } from '@/components/dashboard/kyc/VerificationStepIcons'

type VerificationStep = {
  id: string
  iconSrc: string
  topic: string
  description: string
  isDone: boolean
  isPendingVerification?: boolean
}

interface MerchantKycVerificationStepsModalProps {
  totalSteps: number
  onConfirmDetailsClick: () => void
  onVerifyIdentityClick: () => void
  onUploadBusinessDocumentsClick: () => void
}

const MerchantKycVerificationStepsModal = ({
  totalSteps,
  onConfirmDetailsClick,
  onVerifyIdentityClick,
  onUploadBusinessDocumentsClick,
}: MerchantKycVerificationStepsModalProps) => {
  const safeTotal = Math.max(1, totalSteps)

  const base: VerificationStep[] = [
    {
      id: 'confirm-details',
      iconSrc: Frame1,
      topic: 'Confirm Your Details',
      description: 'Review and verify your personal information to ensure it is accurate before proceeding.',
      isDone: false,
    },
    {
      id: 'verify-identity',
      iconSrc: Frame2,
      topic: 'Verify Your Identity',
      description:
        'Upload a valid government ID and complete a quick face verification to confirm your identity.',
      isDone: false,
    },
    {
      id: 'upload-business-documents',
      iconSrc: uploadBusinessDocumentsIcon,
      topic: 'Upload Business Documents',
      description:
        'Submit the required business documents to complete verification and enable access to financing.',
      isDone: false,
    },
  ]

  const steps = base.slice(0, safeTotal)

  const handleStepClick = (step: VerificationStep) => {
    if (step.id === 'confirm-details') onConfirmDetailsClick()
    if (step.id === 'verify-identity') onVerifyIdentityClick()
    if (step.id === 'upload-business-documents') onUploadBusinessDocumentsClick()
  }

  return (
    <div>
      <div className="flex items-start mb-5">
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-[32px]">Start Your KYC Verification</h2>
          <p className="text-[#6B7488] text-[20px] mt-1">
            Complete your registration and unlock multiple features on Fist Commerce
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          const isCardDisabled = step.isDone

          return (
            <button
              key={step.id}
              type="button"
              disabled={isCardDisabled}
              aria-disabled={isCardDisabled}
              className={`w-full h-[144px] text-left rounded-[6px] border px-6 py-4 flex items-center gap-5 transition bg-[#F6F7FB] border-[#E6E8EC] ${
                isCardDisabled ? 'cursor-default' : 'cursor-pointer'
              }`}
              onClick={() => {
                if (isCardDisabled) return
                handleStepClick(step)
              }}
            >
              <img src={step.iconSrc} alt={`${step.topic} icon`} className="w-[129px] h-[96px] object-contain" />

              <div className="flex flex-col flex-1">
                <div className="text-black font-bold text-[24px]">{step.topic}</div>
                <div className="text-[#6B7488] text-[16px] mt-1">{step.description}</div>
              </div>

              <div className="flex items-center justify-end w-[120px]">
                {step.isDone && !step.isPendingVerification ? (
                  <KycCheckIcon />
                ) : step.isPendingVerification && step.isDone ? (
                  <span className="text-[#F59E0B] text-[20px] font-medium text-right leading-tight">
                    Pending Verification
                  </span>
                ) : (
                  <KycArrowRightIcon />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MerchantKycVerificationStepsModal
