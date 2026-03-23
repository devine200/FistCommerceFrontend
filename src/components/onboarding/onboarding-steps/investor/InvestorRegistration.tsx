import logo from '@/assets/logo.png'

const InvestorRegistration = () => {
  return (
    <div className="flex flex-col gap-4 w-[700px]">
      <div className="flex flex-col gap-2 mb-8">
        <img src={logo} alt="logo" className="inline-block w-[58px] h-[48px]" />
        <h3 className="text-black font-bold text-[20px]">Verify Your identity</h3>
        <p className="text-[#6B7488] font-normal">
          Your information has been automatically filled with your wallet information. Please review and confirm
          the details to proceed with verification.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-[26px] gap-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-black">First Name</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave Chimerem"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Last Name</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave's Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Phone Number</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave's Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Email Address</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave's Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Country of Residence</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave's Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Date of Birth</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave's Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Wallet Address</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="0x9b3e7f2a...4d8c1e6b"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Network</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Arbitrum One"
          />
        </div>
      </div>

      <button type="button" className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full">
        Continue
      </button>
    </div>
  )
}

export default InvestorRegistration