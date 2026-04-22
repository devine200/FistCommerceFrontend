import OnboardingStep from '@/components/onboarding/onboarding-steps/OnboardingStep'
import OnboardingStepOutletGuard from '@/components/session/OnboardingStepOutletGuard'
import logo from '@/assets/logo.png'
import { v4 as uuidv4 } from 'uuid'
import { useLocation, useNavigate } from 'react-router-dom'

const MerchantLayout = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const stepRoutes = [
        '/onboarding/choose-role',
        '/onboarding/merchant/connect-wallet',
        '/onboarding/merchant/verify-identity',
        '/onboarding/merchant/business-profile',
    ]

    const activeIndex = Math.max(
        0,
        stepRoutes.findIndex((route) => pathname.startsWith(route)),
    )

    const handleStepClick = (index: number) => {
        if (index < activeIndex) navigate(stepRoutes[index])
    }

    const steps = [
        {
            title: 'Choose Your Role',
            description:
                'Select how you want to use the platform—invest capital into lending pools or access financing for your business.',
        },
        {
            title: 'Connect Your Wallet',
            description:
                'Link your Web3 wallet to securely manage transactions, investments, and loan repayments on the platform.',
        },
        {
            title: 'Verify Your Identity',
            description:
                'Complete a quick identity check to comply with regulations and ensure a secure financial environment for all users.',
        },
        {
            title: 'Business Profile',
            description:
                'Provide your business details, financial information, and verification documents to enable access to receivable financing.',
        },
    ].map((step, index) => ({ ...step, active: index === activeIndex }))

    return (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-x-[80px] p-4 sm:p-5 min-h-screen overflow-y-auto">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex gap-4 justify-between w-full lg:w-[450px] bg-[#F5F5F5] rounded-xl py-10 lg:py-12 px-4">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-start gap-2">
                        <img src={logo} alt="logo" className="inline-block w-[58px] h-[48px]" />
                        <h2 className="font-bold text-[32px] text-black">Fist Commerce</h2>
                    </div>
                    {steps.map((step) => (
                        <OnboardingStep
                            key={uuidv4()}
                            active={step.active}
                            title={step.title}
                            description={step.description}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile header + stepper */}
            <div className="lg:hidden w-full pb-6 sm:pb-8">
                <div className="flex items-center justify-between">
                    <img src={logo} alt="logo" className="inline-block w-[44px] h-[36px]" />
                </div>

                <div className="mt-6 flex justify-center">
                    <div className="w-full max-w-[420px]">
                        <div className="flex items-center">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center flex-1 min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(i)}
                                        disabled={i >= activeIndex}
                                        aria-label={i < activeIndex ? `Go to step ${i + 1}` : `Step ${i + 1}`}
                                        className={[
                                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
                                            i <= activeIndex ? 'bg-[#195EBC] text-white' : 'bg-[#E6E9F0] text-[#6B7488]',
                                            i < activeIndex ? 'cursor-pointer' : 'cursor-default',
                                            'disabled:opacity-100 disabled:pointer-events-none',
                                        ].join(' ')}
                                    >
                                        {i + 1}
                                    </button>
                                    {i < 3 ? (
                                        <div
                                            className={[
                                                'h-[2px] flex-1',
                                                i < activeIndex ? 'bg-[#195EBC]' : 'bg-[#E6E9F0]',
                                            ].join(' ')}
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center w-full">
                <OnboardingStepOutletGuard />
            </div>
        </div>
    )
}

export default MerchantLayout