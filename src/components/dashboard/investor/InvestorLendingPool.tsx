import LendingPoolOpportunityCard from '@/components/dashboard/LendingPoolOpportunityCard'

const InvestorLendingPool = () => {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-black font-bold text-[20px]">Lending Pools</h3>
      <LendingPoolOpportunityCard viewDetailsTo="/dashboard/investor/lending-pool/fist-commerce-lending-pool" />
    </section>
  )
}

export default InvestorLendingPool
