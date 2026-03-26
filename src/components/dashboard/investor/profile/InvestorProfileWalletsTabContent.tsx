import walletIcon from '@/assets/Icon (1).png'

const InvestorProfileWalletsTabContent = () => {
  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[#4D5D80] text-[28px] font-semibold leading-tight">Connected Wallet</h2>
        <button
          type="button"
          className="h-[40px] rounded-[4px] bg-[#195EBC] px-4 text-white text-[14px] font-medium hover:bg-[#154a9a] transition-colors"
        >
          Connect Wallet
        </button>
      </div>

      <article className="mt-4 rounded-[6px] border border-[#195EBC] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-[6px] bg-[#EEF2F6] flex items-center justify-center">
              <img src={walletIcon} alt="" className="h-5 w-5 object-contain" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[#0B1220] text-[24px] font-semibold leading-tight">MetaMask</p>
                <span className="rounded-full bg-[#E8EFFB] px-2 py-0.5 text-[11px] text-[#195EBC] font-medium">Primary</span>
                <span className="text-[#16A34A] text-[11px] font-medium">Connected</span>
              </div>

              <p className="mt-1 text-[#6B7488] text-[11px] break-all">
                0x7A3B4cBD9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B
                <span className="ml-1 text-[#9CA3AF]">⧉</span>
              </p>
              <p className="mt-1 text-[#8B92A3] text-[12px]">Arbitrum One</p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="text-[#8B92A3] text-[12px]">Balance</p>
            <div className="mt-1 flex items-center gap-2 sm:justify-end">
              <p className="text-[#0B1220] text-[30px] font-semibold leading-tight">$16,000 USDT</p>
              <button type="button" className="text-[#DC2626] text-[12px] underline">
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

export default InvestorProfileWalletsTabContent
