import investIcon from '@/assets/invest-icon.png'
import merchantIcon from '@/assets/merchant-icon.png'
import logo from '@/assets/logo.png'
import { useNavigate } from 'react-router-dom'

interface ChooseRoleProps {
  onContinueInvestor?: () => void
  onContinueMerchant?: () => void
}

const ChooseRole = ({ onContinueInvestor, onContinueMerchant }: ChooseRoleProps) => {
  const navigate = useNavigate()

  const handleInvestor = () => {
    if (onContinueInvestor) onContinueInvestor()
    else navigate('/onboarding/investor/connect-wallet')
  }

  const handleMerchant = () => {
    if (onContinueMerchant) onContinueMerchant()
    else navigate('/onboarding/merchant/connect-wallet')
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 mb-8">
            <img src={logo} alt="logo" className="inline-block w-[58px] h-[48px]" />
            <h3 className="text-black font-bold text-[20px]">Choose Your Role</h3>
            <p className="text-[#6B7488]">Select how you want to use the platform—invest capital into lending pools or access financing for your business.</p>
        </div>

        <div className="flex gap-[40px]">
            <div className="flex flex-col gap-4 w-[330px] justify-between items-center border border-[#EAEAEA] py-8 px-4">
                <img src={investIcon} alt="invest icon" className="inline-block w-[170px] h-[170dpx] " />
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-black font-bold text-[20px]">Invest in Lending Pools</h2>
                        <p className="text-[#6B7488]">Fund verified receivables and earn returns as merchants repay their loans over time.</p>
                    </div>
                    <button type="button" onClick={handleInvestor} className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full">Continue as Investor</button>
                </div>
            </div>
            <div className="flex flex-col gap-4 w-[330px] justify-between items-center border border-[#EAEAEA] py-8 px-4">
                <img src={merchantIcon} alt="merchant icon" className="inline-block w-[170px] h-[170dpx] " />
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-black font-bold text-[20px]">Access Capital for Your Business</h2>
                        <p className="text-[#6B7488]">Unlock financing by submitting receivables and receive funding from investors to grow your business.</p>
                    </div>
                    <button type="button" onClick={handleMerchant} className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full">Continue as Merchant</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ChooseRole