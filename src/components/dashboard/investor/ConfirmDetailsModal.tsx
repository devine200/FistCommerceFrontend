import backArrowIcon from '@/assets/ph_arrow-left.png'

interface ConfirmDetailsModalProps {
  onBack: () => void
  onContinue: () => void
}

const ConfirmDetailsModal = ({ onBack, onContinue }: ConfirmDetailsModalProps) => {
  return (
    <div className="max-w-[620px] mx-auto">
      <div className="flex items-start gap-3 mb-3">
        <button type="button" onClick={onBack} className="h-[40px] w-[40px] flex items-center justify-center shrink-0">
          <img src={backArrowIcon} alt="back" className="w-[24px] h-[24px] object-contain" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-[20px] sm:text-[26px]">Confirm Your Details</h2>
          <p className="text-[#6B7488] text-[13px] sm:text-[16px] mt-1">
            Review and verify your personal information to ensure it is accurate before proceeding.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-6 mt-5 sm:mt-6">
        <div className="col-span-2 flex flex-col gap-3">
          <label className="text-black text-[14px] sm:text-[16px]">Full Name</label>
          <input
            defaultValue="Dave Chimerem"
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] text-[14px] sm:text-[16px] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-black text-[14px] sm:text-[16px]">Phone Number</label>
          <input
            defaultValue="Dave&apos;s Enterprises"
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] text-[14px] sm:text-[16px] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-black text-[14px] sm:text-[16px]">Email Address</label>
          <input
            defaultValue="Dave&apos;s Enterprises"
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] text-[14px] sm:text-[16px] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-black text-[14px] sm:text-[16px]">Wallet Address</label>
          <input
            defaultValue="0x9b3e7f2a...4d8c1e6b"
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] text-[14px] sm:text-[16px] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-black text-[14px] sm:text-[16px]">Network</label>
          <input
            defaultValue="Arbitrum One"
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] text-[14px] sm:text-[16px] focus:outline-none"
          />
        </div>
      </div>

      <button type="button" onClick={onContinue} className="mt-5 bg-[#195EBC] text-white px-5 py-3 rounded-md w-full text-[15px] sm:text-[16px] font-semibold">
        Continue
      </button>
    </div>
  )
}

export default ConfirmDetailsModal

