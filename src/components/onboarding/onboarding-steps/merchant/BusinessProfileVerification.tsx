import { useNavigate } from 'react-router-dom'

const BusinessProfileVerification = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 w-full max-w-[700px] lg:w-[700px]">
      <div className="flex flex-col gap-2 mb-6 lg:mb-8">
        <h3 className="text-black font-bold text-[20px]">Business Profile</h3>
        <p className="text-[#6B7488] font-normal">
          Provide your business details, financial information, and verification documents to enable access to
          receivable financing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[26px] gap-y-4 sm:gap-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-black">Business Name</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave Chimerem"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Industry</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave&apos;s Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Country of Registration</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave&apos;s Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Business Address</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave&apos;s Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Years in Operation</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue="Dave&apos;s Enterprises"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-black">Business Website (opt)</span>
          <input
            className="w-full border border-[#CFE0FF] rounded-md px-4 py-3 text-[#195EBC] placeholder:text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC]"
            defaultValue=""
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 lg:static lg:pt-0">
        <button
          type="button"
          onClick={() => navigate('/dashboard/merchant/overview')}
          className="bg-[#195EBC] text-white px-4 py-2 rounded-md w-full"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default BusinessProfileVerification