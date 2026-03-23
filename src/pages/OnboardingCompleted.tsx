import { useNavigate, useSearchParams } from 'react-router-dom'

import investmentCompletedIllustration from '@/assets/investment-completed.png'
import merchantCompletedIllustration from '@/assets/merchant-onboarding-completed.png'

export enum OnboardingCompletedVariant {
  Investor = 'investor',
  Merchant = 'merchant',
}

interface OnboardingCompletedProps {
  variant?: OnboardingCompletedVariant
}

const OnboardingCompleted = ({ variant = OnboardingCompletedVariant.Investor }: OnboardingCompletedProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const variantFromQuery = searchParams.get('variant')
  const resolvedVariant: OnboardingCompletedVariant =
    variantFromQuery === OnboardingCompletedVariant.Merchant || variantFromQuery === OnboardingCompletedVariant.Investor
      ? variantFromQuery
      : variant

  const content =
    resolvedVariant === OnboardingCompletedVariant.Merchant
      ? {
          illustration: merchantCompletedIllustration,
          alt: 'merchant onboarding completed',
          subtitle: 'Continue to the platform to start managing your account and monetary activities.',
          backgroundClass: 'bg-[#F5F5F5]',
        }
      : {
          illustration: investmentCompletedIllustration,
          alt: 'investment onboarding completed',
          subtitle: 'Continue to the platform to start managing your investments and activities.',
          backgroundClass: 'bg-white',
        }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-5 ${content.backgroundClass}`}>
      <div className="flex flex-col items-center text-center gap-4 w-full max-w-[800px]">
        <img
          src={content.illustration}
          alt={content.alt}
          className="inline-block w-[170px] h-[170px] object-contain"
        />

        <h1 className="text-black font-bold text-[44px]">Your Account is Ready</h1>

        <p className="text-[#6B7488] font-normal text-[12px] max-w-[800px]">
          {content.subtitle}
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full max-w-[800px] mt-2 text-[14px]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default OnboardingCompleted