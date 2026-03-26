import logo from '@/assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '@/state/session'

interface InvestmentExplainerProps {
    onContinue?: () => void
}

const InvestmentExplainer = ({ onContinue }: InvestmentExplainerProps) => {
    const navigate = useNavigate()

    const handleContinue = () => {
        if (onContinue) return onContinue()
        completeOnboarding('investor')
        navigate('/dashboard/investor/overview')
    }

    return (
        <div className="flex flex-col gap-4 w-[700px]">
            <div className="flex flex-col gap-2 mb-8">
                <img src={logo} alt="logo" className="inline-block w-[58px] h-[48px]" />
                <h3 className="text-black font-bold text-[20px]">Start Investing</h3>
                <p className="text-[#6B7488] font-normal">
                    Learn how the lending pool works, expected returns, and how your 
                    capital will be used to fund verified receivables.
                </p>
            </div>
            <div className="flex flex-col gap-4 text-black">
                <h3 className="font-bold text-[16px]">Overview</h3>
                <p className="font-normal">
                    This pool allocates investor capital to short-duration 
                    merchant receivables with an average maturity of 30–60 
                    days, deploying funds programmatically through a dedicated smart contract 
                    across verified merchants that meet predefined underwriting standards.
                </p>
                <p className="font-normal">
                    Capital is diversified across multiple receivables to reduce concentration 
                    risk, and each financed invoice is tokenized and linked to verified transactional 
                    data submitted during merchant onboarding. Borrowed funds are secured through receivable 
                    assignments, merchant credit evaluation, and where applicable, over-collateralization 
                    buffers and reserve allocations designed to absorb first-loss exposure. 
                </p>
                <p className="font-normal">
                    Risk is managed through pre-loan KYC verification, historical repayment analysis, 
                    diversification across borrowers, and audited smart contract infrastructure. 
                    In the event of delayed or failed repayment, a structured recovery process is 
                    initiated, including grace periods and enforcement mechanisms defined within 
                    receivable agreements, with reserve capital deployed before any proportional 
                    impact to pool participants. 
                </p>
                <p className="font-normal">
                    Liquidity availability and withdrawal timing are dependent on pool utilization 
                    and repayment cycles, and yield is distributed according to the predefined schedule 
                    of the pool.
                </p>
                <button type="button" onClick={handleContinue} className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full">Continue</button>
            </div>
        </div>
    )
}

export default InvestmentExplainer