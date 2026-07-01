import ContractRegistryPanel from '@/components/admin/settings/ContractRegistryPanel'
import FundingPoolPanel from '@/components/admin/settings/FundingPoolPanel'
import PayoutRouterPanel from '@/components/admin/settings/PayoutRouterPanel'
import ProtocolConstantsPanel from '@/components/admin/settings/ProtocolConstantsPanel'
import ProtocolSafetyPanel from '@/components/admin/settings/ProtocolSafetyPanel'
import RiskAllocationPanel from '@/components/admin/settings/RiskAllocationPanel'

const AdminSettingsPage = () => {
  return (
    <div className="w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6">
      <div className="rounded-[10px] border border-[#E6E8EC] bg-[#F8FAFC] px-5 py-4">
        <p className="text-[#6B7488] text-[14px]">
          Editable protocol settings submit multisig governance proposals for on-chain changes. Apply shows a
          loading state, then sign or review the proposal in the governance flow. Contract Registry and Protocol
          Constants are read-only reference panels.
        </p>
      </div>

      <ProtocolSafetyPanel />
      <RiskAllocationPanel />
      <FundingPoolPanel />
      <PayoutRouterPanel />
      <ContractRegistryPanel />
      <ProtocolConstantsPanel />
    </div>
  )
}

export default AdminSettingsPage
