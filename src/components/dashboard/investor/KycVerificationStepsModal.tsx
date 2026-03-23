import Frame0 from '@/assets/Frame.png'
import Frame1 from '@/assets/Frame (1).png'
import Frame2 from '@/assets/Frame (2).png'

type VerificationStep = {
  id: string
  iconSrc: string
  topic: string
  description: string
  isDone: boolean
  isPendingVerification?: boolean
}

interface KycVerificationStepsModalProps {
  totalSteps: number
  onConfirmDetailsClick: () => void
  onVerifyIdentityClick: () => void
}

const CheckIcon = () => {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20 7L10.5 16.5L4 10"
        stroke="#195EBC"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const ArrowRightIcon = () => {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 12H19" stroke="#195EBC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 6L19 12L13 18" stroke="#195EBC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const KycVerificationStepsModal = ({
  totalSteps,
  onConfirmDetailsClick,
  onVerifyIdentityClick,
}: KycVerificationStepsModalProps) => {
  const safeTotal = Math.max(1, totalSteps)

  const base: VerificationStep[] = [
    {
      id: 'connect-wallet',
      iconSrc: Frame0,
      topic: 'Connect Your Wallet',
      description: 'Connect your wallet to access your funds, manage investments, and interact with the platform.',
      isDone: true,
    },
    {
      id: 'confirm-details',
      iconSrc: Frame1,
      topic: 'Confirm Your Details',
      description: 'Review and verify your personal information to ensure it is accurate before proceeding.',
      isDone: true,
    },
    {
      id: 'verify-identity',
      iconSrc: Frame2,
      topic: 'Verify Your Identity',
      description: 'Upload a valid government ID and complete a quick face verification to confirm your identity.',
      isDone: false,
      isPendingVerification: false,
    },
  ]

  const steps = base.slice(0, safeTotal)

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
          const isCardDisabled = Boolean(step.isDone || step.isPendingVerification)

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
                if (step.id === 'confirm-details') onConfirmDetailsClick()
                if (step.id === 'verify-identity') onVerifyIdentityClick()
              }}
            >
            <img src={step.iconSrc} alt={`${step.topic} icon`} className="w-[129px] h-[96px] object-contain" />

            <div className="flex flex-col flex-1">
              <div className="text-black font-bold text-[24px]">{step.topic}</div>
              <div className="text-[#6B7488] text-[16px] mt-1">{step.description}</div>
            </div>

            <div className="flex items-center justify-end w-[120px]">
              {step.isDone ? (
                <CheckIcon />
              ) : step.isPendingVerification ? (
                <span className="text-[#F59E0B] text-[20px] font-medium text-right leading-tight">Pending Verification</span>
              ) : (
                <ArrowRightIcon />
              )}
            </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default KycVerificationStepsModal

