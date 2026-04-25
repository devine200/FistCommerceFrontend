import Frame0 from '@/assets/Frame.png'
import Frame2 from '@/assets/Frame (2).png'

import { KycArrowRightIcon, KycCheckIcon } from '@/components/dashboard/kyc/VerificationStepIcons'

type VerificationStep = {
  id: string
  iconSrc: string
  topic: string
  description: string
  isDone: boolean
  isPendingVerification?: boolean
}

interface InvestorKycVerificationStepsModalProps {
  walletConnected: boolean
  /** True when GET `kyc_token` is non-empty — in-progress list shows identity only. */
  hasKycToken: boolean
  kycVerified: boolean
  kycRejected: boolean
  onVerifyIdentityClick: () => void
}

const InvestorKycVerificationStepsModal = ({
  walletConnected,
  hasKycToken,
  kycVerified,
  kycRejected,
  onVerifyIdentityClick,
}: InvestorKycVerificationStepsModalProps) => {
  const steps: VerificationStep[] = hasKycToken
    ? [
        {
          id: 'verify-identity',
          iconSrc: Frame2,
          topic: 'Verify Your Identity',
          description:
            'Upload a valid government ID and complete Sumsub verification to confirm your identity.',
          isDone: kycVerified || (Boolean(hasKycToken) && !kycVerified && !kycRejected),
          isPendingVerification: Boolean(hasKycToken && !kycVerified && !kycRejected),
        },
      ]
    : [
        {
          id: 'connect-wallet',
          iconSrc: Frame0,
          topic: 'Connect Your Wallet',
          description:
            'Connect your wallet to access your funds, manage investments, and interact with the platform.',
          isDone: walletConnected,
        },
        {
          id: 'verify-identity',
          iconSrc: Frame2,
          topic: 'Verify Your Identity',
          description:
            'Upload a valid government ID and complete Sumsub verification to confirm your identity.',
          isDone: kycVerified,
          isPendingVerification: false,
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
          Your previous verification was not approved. Please submit updated documents when you retry identity
          verification.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          const isCardDisabled =
            step.id === 'connect-wallet' ? walletConnected : step.id === 'verify-identity' ? kycVerified : false

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

export default InvestorKycVerificationStepsModal
