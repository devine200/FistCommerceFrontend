const DashboardTopBar = () => {
  return (
    <header className="h-[56px] bg-white border-b border-[#E6E8EC] px-5 flex items-center justify-between">
      <h1 className="text-black font-medium">Dashboard</h1>

      <div className="flex items-center gap-3">
        <button type="button" className="h-[32px] w-[32px] border border-[#E6E8EC] rounded-[4px] text-[14px]">
          🔔
        </button>

        <div className="h-[32px] px-3 border border-[#E6E8EC] rounded-[4px] flex items-center gap-2 text-[14px] text-[#4D5D80]">
          <span>user1234@gmail.com</span>
          <span>👤</span>
        </div>

        <button type="button" className="bg-[#195EBC] text-white px-4 h-[32px] rounded-[4px] text-[14px]">
          Connect Wallet
        </button>
      </div>
    </header>
  )
}

export default DashboardTopBar
