import fundingPoolImage from '@/assets/fundingpool_img.png'

const WalletGateOpportunities = () => {
  const cards = [1, 2]

  return (
    <section className="relative border-2 border-[#2E8BFF] rounded-[2px] bg-white/80 p-6 h-[500px] overflow-hidden">
      <div className="flex flex-col gap-6 opacity-35">
        {cards.map((card) => (
          <div key={card} className="flex items-start gap-4 blur-[1px]">
            <img src={fundingPoolImage} alt="funding opportunity" className="w-[170px] h-[116px] object-cover rounded-[2px]" />
            <div className="pt-3">
              <h3 className="text-[16px] font-semibold text-[#1E2A46]">SME Loan Lending Pool</h3>
              <p className="text-[12px] text-[#7D879A] mt-1">Estimated APY 12% | Duration 30 days</p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-white/45" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <h3 className="text-[#195EBC] font-bold text-[40px]">Connect Your Wallet</h3>
        <p className="text-[#26344D] mt-1 text-[24px]">
          Kindly connect your wallet to see all opportunities for your receivable
        </p>
        <button type="button" className="mt-3 bg-[#195EBC] text-white px-4 py-4 rounded-[4px] text-[24px] leading-none">
          Connect Wallet
        </button>
      </div>
    </section>
  )
}

export default WalletGateOpportunities
