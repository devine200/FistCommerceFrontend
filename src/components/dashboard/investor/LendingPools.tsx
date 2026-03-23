import fundingPoolImage from '@/assets/fundingpool_img.png'

const LendingPools = () => {
  return (
    <section className="bg-white border border-[#DFE2E8] rounded-[6px] p-4">
      <h3 className="text-black font-bold text-[34px] mb-4">Lending Pools</h3>

      <div className="border border-[#DFE2E8] rounded-[6px] p-3 flex items-start gap-4">
        <img src={fundingPoolImage} alt="lending pool" className="w-[240px] h-[170px] object-cover rounded-[3px]" />

        <div className="flex-1 pt-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-[#111827] font-semibold text-[36px] leading-tight">Fist Commerce Lending Pool</h4>
            <button type="button" className="text-[#195EBC] underline text-[14px] whitespace-nowrap mt-1">
              Click to view details
            </button>
          </div>

          <p className="text-[#6B7488] text-[24px] mt-2">For short-duration loans with stable returns.</p>

          <div className="text-[24px] text-[#6B7488] mt-2 space-y-1">
            <p>
              <span className="text-[#6B7488]">APY:</span>{' '}
              <span className="text-[#111827]">6-8% APY</span>
            </p>
            <p>
              <span className="text-[#6B7488]">TVL:</span>{' '}
              <span className="text-[#111827]">538,500 USDC</span>
            </p>
            <p>
              <span className="text-[#B5BDCC]">Minimum Deposit:</span>{' '}
              <span className="text-[#111827]">100 USDC</span>
            </p>
            <p>
              <span className="text-[#B5BDCC]">Utilization:</span>{' '}
              <span className="text-[#111827]">60% Allocated</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LendingPools
