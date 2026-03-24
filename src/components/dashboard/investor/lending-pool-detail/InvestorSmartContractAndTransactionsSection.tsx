import { useCallback, useState } from 'react'

import type { ContractField, RecentTx } from '@/components/dashboard/investor/lending-pool-detail/types'
import { POOL_SECTION_TITLE } from '@/components/dashboard/shared/poolDetailTypography'

interface InvestorSmartContractAndTransactionsSectionProps {
  contractRows: ContractField[]
  transactions: RecentTx[]
}

const ETHERSCAN_HREF = 'https://arbiscan.io'

function ExternalLinkGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

const amountClass = (tone: RecentTx['amountTone']) => {
  if (tone === 'positive') return 'text-[#16A34A] font-bold text-[15px] tabular-nums'
  if (tone === 'negative') return 'text-[#0B1220] font-bold text-[15px] tabular-nums'
  return 'text-[#0B1220] font-semibold text-[15px] tabular-nums'
}

const InvestorSmartContractAndTransactionsSection = ({
  contractRows,
  transactions,
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
                <span className="text-[#0B1220] font-semibold text-[15px] leading-snug">{row.value}</span>
                {isAddress ? (
                  <button
                    type="button"
                    onClick={() => copyAddress(row)}
                    className="text-[#195EBC] text-[13px] font-semibold hover:underline ml-0.5"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                ) : null}
                {row.badge ? (
                  <span className="inline-flex items-center rounded-full border border-[#86EFAC] bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold px-2 py-0.5 leading-none">
                    {row.badge}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-[#E6E8EC]">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className={POOL_SECTION_TITLE}>Recent Transactions</h2>
          <a
            href={ETHERSCAN_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#195EBC] text-[15px] font-semibold hover:underline shrink-0"
          >
            View on Etherscan
            <ExternalLinkGlyph className="opacity-90" />
          </a>
        </div>

        <div className="rounded-[10px] border border-[#E6E8EC] overflow-hidden bg-white">
          <ul className="divide-y divide-[#E6E8EC]">
            {transactions.map((tx) => (
              <li key={tx.id}>
                <div className="flex flex-col gap-3 py-3 px-4 sm:flex-row sm:items-center sm:gap-8">
                  <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                    <span className="inline-flex w-fit max-w-full rounded-[6px] border border-[#E8EBF0] bg-[#F4F7F9] px-2.5 py-1 text-[#195EBC] text-[13px] font-medium tracking-tight">
                      {tx.walletShort}
                    </span>
                    <span className="text-[#0B1220] font-bold text-[15px] leading-tight">{tx.type}</span>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-6 sm:justify-end sm:shrink-0 sm:min-w-56">
                    <p className={`text-left sm:text-right sm:flex-1 ${amountClass(tx.amountTone)}`}>{tx.amount}</p>
                    <p className="text-[#8B92A3] text-[13px] text-right whitespace-nowrap sm:min-w-22">
                      {tx.timeAgo}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default InvestorSmartContractAndTransactionsSection
