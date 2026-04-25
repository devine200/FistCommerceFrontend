import Frame0 from '@/assets/Frame.png'
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

const INSURANCE_DESCRIPTION =
  'Verified separately by our team. This step updates automatically when your business insurance is on file.'

interface MerchantKycVerificationStepsModalProps {
  walletConnected: boolean
  hasKycToken: boolean
  kycVerified: boolean
  insuranceVerified: boolean
  kycRejected: boolean
  onVerifyIdentityClick: () => void
}

const MerchantKycVerificationStepsModal = ({
  walletConnected,
  hasKycToken,
  kycVerified,
  insuranceVerified,
  kycRejected,
  onVerifyIdentityClick,
}: MerchantKycVerificationStepsModalProps) => {
  const steps: VerificationStep[] = hasKycToken
    ? [
        {
          id: 'verify-identity',
          iconSrc: Frame2,
          topic: 'Verify Your Identity',
          description:
            'Upload a valid government ID and complete Sumsub verification for your business representative.',
          isDone: kycVerified || (Boolean(hasKycToken) && !kycVerified && !kycRejected),
          isPendingVerification: Boolean(hasKycToken && !kycVerified && !kycRejected),
        },
        {
          id: 'insurance-verification',
          iconSrc: uploadBusinessDocumentsIcon,
          topic: 'Insurance Verification',
          description: INSURANCE_DESCRIPTION,
          isDone: insuranceVerified,
          isPendingVerification: Boolean(kycVerified && !insuranceVerified),
        },
      ]
    : [
        {
          id: 'connect-wallet',
          iconSrc: Frame0,
          topic: 'Connect Your Wallet',
          description:
            'Connect your wallet to access financing, manage receivables, and interact with the platform.',
          isDone: walletConnected,
        },
        {
          id: 'verify-identity',
          iconSrc: Frame2,
          topic: 'Verify Your Identity',
          description:
            'Upload a valid government ID and complete Sumsub verification for your business representative.',
          isDone: kycVerified,
          isPendingVerification: false,
        },
        {
          id: 'insurance-verification',
          iconSrc: uploadBusinessDocumentsIcon,
          topic: 'Insurance Verification',
          description: INSURANCE_DESCRIPTION,
          isDone: insuranceVerified,
          isPendingVerification: Boolean(kycVerified && !insuranceVerified),
        },
      ]

  const handleStepClick = (step: VerificationStep) => {
    if (step.id === 'verify-identity') onVerifyIdentityClick()
  }

  return (
    <div>
      <div className="flex items-start mb-5">
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-[20px] sm:text-[26px]">Start Your KYC Verification</h2>
          <p className="text-[#6B7488] text-[13px] sm:text-[16px] mt-1">
            Complete your registration and unlock multiple features on Fist Commerce
          </p>
        </div>
      </div>

      {kycRejected ? (
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] sm:text-[14px] text-red-900">
          Your previous verification was not approved. Submit updated documents when you retry the steps below.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          if (step.id === 'insurance-verification') {
            return (
              <div
                key={step.id}
                role="status"
                aria-label={`${step.topic}: ${insuranceVerified ? 'verified' : kycVerified ? 'pending verification' : 'not started'}`}
                className="w-full min-h-[112px] sm:min-h-[144px] text-left rounded-[6px] border px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-5 bg-[#F6F7FB] border-[#E6E8EC]"
              >
                <img
                  src={step.iconSrc}
                  alt=""
                  className="w-[88px] h-[66px] sm:w-[129px] sm:h-[96px] object-contain shrink-0"
                />

                <div className="flex flex-col flex-1">
                  <div className="text-black font-bold text-[14px] sm:text-[18px]">{step.topic}</div>
                  <div className="text-[#6B7488] text-[12px] sm:text-[14px] mt-1">{step.description}</div>
                </div>

                <div className="flex items-center justify-end w-[52px] sm:w-[140px] shrink-0">
                  {insuranceVerified ? (
                    <KycCheckIcon />
                  ) : kycVerified ? (
                    <span className="text-[#F59E0B] text-[14px] sm:text-[16px] font-medium text-right leading-tight">
                      Pending verification
                    </span>
                  ) : (
                    <span className="text-[#A0A8B8] text-[12px] sm:text-[14px] text-right leading-tight">
                      Not started
                    </span>
                  )}
                </div>
              </div>
            )
          }

          const isCardDisabled =
            step.id === 'connect-wallet'
              ? walletConnected
              : step.id === 'verify-identity'
                ? kycVerified
                : false

          return (
            <button
              key={step.id}
              type="button"
              disabled={isCardDisabled}
              aria-disabled={isCardDisabled}
              className={`w-full min-h-[112px] sm:min-h-[144px] text-left rounded-[6px] border px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-5 transition bg-[#F6F7FB] border-[#E6E8EC] ${
                isCardDisabled ? 'cursor-default' : 'cursor-pointer'
              }`}
              onClick={() => {
                if (isCardDisabled) return
                if (step.id === 'connect-wallet') return
                handleStepClick(step)
              }}
            >
              <img src={step.iconSrc} alt={`${step.topic} icon`} className="w-[88px] h-[66px] sm:w-[129px] sm:h-[96px] object-contain shrink-0" />

              <div className="flex flex-col flex-1">
                <div className="text-black font-bold text-[14px] sm:text-[18px]">{step.topic}</div>
                <div className="text-[#6B7488] text-[12px] sm:text-[14px] mt-1">{step.description}</div>
              </div>

              <div className="flex items-center justify-end w-[52px] sm:w-[120px] shrink-0">
                {step.isDone && !step.isPendingVerification ? (
                  <KycCheckIcon />
                ) : step.isPendingVerification && step.isDone ? (
                  <span className="text-[#F59E0B] text-[20px] font-medium text-right leading-tight">Pending Verification</span>
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
