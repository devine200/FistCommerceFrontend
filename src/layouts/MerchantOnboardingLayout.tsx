import OnboardingStep from '@/components/onboarding/onboarding-steps/OnboardingStep'
import logo from '@/assets/logo.png'
import { v4 as uuidv4 } from 'uuid'
import { Outlet } from 'react-router-dom'

const MerchantLayout = () => {
    const steps = [
        {
            title: 'Choose Your Role',
            description: 'Select how you want to use the platform—invest capital into lending pools or access financing for your business.',
            active: true
        }, 
        {
            title: 'Connect Your Wallet',
            description: 'Link your Web3 wallet to securely manage transactions, investments, and loan repayments on the platform.',
            active: false
        },
        {
            title: 'Verify Your Identity',
            description: 'Complete a quick identity check to comply with regulations and ensure a secure financial environment for all users.',
            active: false
        },
        {
            title: 'Business Profile',
            description: 'Provide your business details, financial information, and verification documents to enable access to receivable financing.',
            active: false
        },
    ]

    return (
        <div className="flex items-center gap-x-[80px] h-screen p-5">
            <div className="flex gap-4 justify-between w-[450px] bg-[#F5F5F5] rounded-xl py-12 px-4">
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
            <div className="flex justify-center items-center">
                <Outlet />
            </div>
        </div>
    )
}

export default MerchantLayout