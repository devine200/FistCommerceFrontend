import activeStepDot from '@/assets/active-step-dot.png'
import inactiveStepDot from '@/assets/inactive-step-dot.png'

interface OnboardingStepProps {
    active: boolean
    title: string
    description: string
}

const OnboardingStep = ({ active, title, description }: OnboardingStepProps) => {
    return (
        <div className="flex justify-start items-center gap-2 border-b border-[#EAEAEA] py-5">
            <img src={active ? activeStepDot : inactiveStepDot} alt="active step dot" className="inline-block w-[12px] h-[12px]" />
            <div className="flex flex-col gap-2">
                <h3 className={`${active ? 'text-black' : 'text-[#D5D5D5]'} font-bold text-[20px]`}>{title}</h3>
                <p className={`${active ? 'text-[#6B7488]' : 'text-[#D5D5D5]'}`}>{description}</p>
            </div>
        </div>
    )
}

export default OnboardingStep