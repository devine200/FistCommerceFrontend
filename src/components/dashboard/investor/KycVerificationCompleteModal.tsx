import kycPendingIllustration from '@/assets/kyc-inprogress.png'

interface KycVerificationCompleteModalProps {
  onBackToDashboard: () => void
}

const KycVerificationCompleteModal = ({ onBackToDashboard }: KycVerificationCompleteModalProps) => {
  return (
    <div className="max-w-[620px] mx-auto flex flex-col items-center text-center">
      <img src={kycPendingIllustration} alt="kyc pending verification" className="w-[120px] h-[120px] object-contain" />

      <h2 className="mt-5 text-black font-bold text-[40px]">KYC Verification Complete</h2>
      <p className="mt-2 text-[#6B7488] text-[18px]">We will notify you when your documents have been verified.</p>

      <button
        type="button"
        onClick={onBackToDashboard}
        className="mt-8 w-full bg-[#195EBC] text-white text-[22px] rounded-[6px] px-5 py-3"
      >
        Back to Dashboard
      </button>
    </div>
  )
}

export default KycVerificationCompleteModal
