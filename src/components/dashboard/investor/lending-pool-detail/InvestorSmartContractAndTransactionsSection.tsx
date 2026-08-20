import { useCallback, useState } from 'react'

import type { ContractField, RecentTx } from '@/components/dashboard/investor/lending-pool-detail/types'
import { RecentTransactionsSection } from '@/components/dashboard/shared/RecentTransactionsSection'
import { POOL_SECTION_TITLE } from '@/components/dashboard/shared/poolDetailTypography'
import type { ListPaginationMeta } from '@/utils/listPagination'

interface InvestorSmartContractAndTransactionsSectionProps {
  contractRows: ContractField[]
  transactions: RecentTx[]
  /** Full URL to the pool contract on the active network explorer (or API-provided explorer). */
  contractExplorerHref?: string | null
  paginationMeta: ListPaginationMeta
  onPageChange: (page: number) => void
  loading?: boolean
}

const InvestorSmartContractAndTransactionsSection = ({
  contractRows,
  transactions,
  contractExplorerHref,
  paginationMeta,
  onPageChange,
  loading = false,
}: InvestorSmartContractAndTransactionsSectionProps) => {
  const [copied, setCopied] = useState(false)

  const copyAddress = useCallback(async (row: ContractField) => {
    const text = row.copyValue ?? row.value
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
      <h2 className={POOL_SECTION_TITLE}>Smart Contract Transparency</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {contractRows.map((row) => {
          const isAddress = row.label === 'Smart Contract Address'
          return (
            <div
              key={row.label}
              className="rounded-[10px] border border-[#E6E8EC] bg-white px-4 py-3 flex flex-col gap-1.5"
            >
              <span className="text-[#8B92A3] text-[13px] font-medium leading-snug">{row.label}</span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-h-[24px]">
                <span className="text-[#0B1220] text-[15px] font-semibold break-all">{row.value}</span>
                {row.badge ? (
                  <span className="rounded-full bg-[#E8EFFB] text-[#195EBC] text-[11px] font-semibold px-2 py-0.5">
                    {row.badge}
                  </span>
                ) : null}
                {isAddress ? (
                  <button
                    type="button"
                    onClick={() => void copyAddress(row)}
                    className="text-[#195EBC] text-[13px] font-semibold hover:underline"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-[#E6E8EC]">
        <RecentTransactionsSection
          transactions={transactions}
          paginationMeta={paginationMeta}
          onPageChange={onPageChange}
          loading={loading}
          contractExplorerHref={contractExplorerHref}
          bordered={false}
        />
      </div>
    </section>
  )
}

export default InvestorSmartContractAndTransactionsSection
