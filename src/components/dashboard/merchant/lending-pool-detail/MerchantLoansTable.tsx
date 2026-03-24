import { useState } from 'react'

import MerchantLoanDetailsModal from '@/components/dashboard/merchant/lending-pool-detail/MerchantLoanDetailsModal'
import type { MerchantLoanDetailExtended, MerchantLoanTableRowData } from '@/components/dashboard/merchant/lending-pool-detail/types'

const MOCK_EXTENDED: Record<string, Partial<MerchantLoanDetailExtended>> = {
  '1': {
    purpose: 'Inventory purchase order financing',
    collateral: 'Receivables pledge',
    documentsNote: '3 files',
  },
  '2': {
    purpose: 'Equipment bridge',
    collateral: 'Unsecured',
    documentsNote: '2 files',
  },
  '3': {
    purpose: 'Working capital',
    collateral: 'Unsecured',
  },
  '4': {
    purpose: 'PO financing',
    collateral: 'Invoice pledge',
  },
}

interface MerchantLoansTableProps {
  loans: MerchantLoanTableRowData[]
}

const MerchantLoansTable = ({ loans }: MerchantLoansTableProps) => {
  const [selected, setSelected] = useState<MerchantLoanDetailExtended | null>(null)

  const openDetails = (row: MerchantLoanTableRowData) => {
    const extra = MOCK_EXTENDED[row.id] ?? {}
    setSelected({ ...row, ...extra })
  }

  return (
    <>
      <section className="rounded-[12px] border border-[#DFE2E8] bg-white overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 text-[#0B1220] font-bold text-[20px] border-b border-[#E6E8EC] bg-white">Merchant loans</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[14px] border-collapse">
            <thead>
              <tr className="bg-[#0F2744] text-white">
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Merchant</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Loan Amount</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Issue Date</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Repayment Due</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Documents</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Repayment Amount</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide">Debt Status</th>
                <th className="px-5 py-3.5 font-semibold text-[13px] tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, rowIndex) => (
                <tr
                  key={loan.id}
                  className={`border-t border-[#E8EBF0] ${rowIndex % 2 === 1 ? 'bg-[#F4F7F9]' : 'bg-white'} hover:bg-[#EEF6FF] transition-colors`}
                >
                  <td className="px-5 py-4 align-top">
                    <div className="text-[#0B1220] font-bold">{loan.merchantName}</div>
                    <div className="text-[#195EBC] text-[12px] mt-1 font-medium break-all">{loan.walletShort}</div>
                  </td>
                  <td className="px-5 py-4 text-[#0B1220] font-medium">{loan.loanAmount}</td>
                  <td className="px-5 py-4 text-[#3A4356]">{loan.issueDate}</td>
                  <td className="px-5 py-4 text-[#3A4356]">{loan.repaymentDue}</td>
                  <td className="px-5 py-4">
                    <button type="button" className="text-[#195EBC] font-semibold hover:underline text-[14px]">
                      View All
                    </button>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="text-[#0B1220] font-bold">{loan.repaymentAmount}</div>
                    {loan.repaymentApy ? (
                      <div className="text-[#195EBC] text-[12px] font-medium mt-1">{loan.repaymentApy}</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        loan.debtStatus.toLowerCase() === 'unpaid'
                          ? 'text-[#B45309] font-semibold'
                          : 'text-[#0B1220] font-medium'
                      }
                    >
                      {loan.debtStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openDetails(loan)}
                      className="text-[#195EBC] font-semibold underline underline-offset-2 hover:opacity-90 text-[14px]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <MerchantLoanDetailsModal loan={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export default MerchantLoansTable
