import activityArrowIcon from '@/assets/arrow.png'
import activityTrendIcon from '@/assets/Vector.png'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { fetchInvestorTransactions, type InvestorTransactionApi } from '@/api/metrics'
import { blockExplorerTxUrl, getDefaultSepoliaBlockExplorerBase } from '@/api/payout'
import { useAppSelector } from '@/store/hooks'

type ActivityItem = {
  id: string
  titlePrefix: string
  poolName: string
  date: string
  amount: string
  positive?: boolean
  transactionType: 'deposit' | 'withdrawal'
  explorerHref?: string | null
}

type ActivityFilter = 'all' | 'deposits' | 'withdrawals'

function formatUsdWholeFloorTowardZero(raw: string): string {
  const t = raw.trim()
  if (!t) return '—'
  const cleaned = t.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return '—'
  const floored = n >= 0 ? Math.floor(n) : Math.ceil(n)
  return floored.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

const amountClass = (item: ActivityItem) => {
  if (item.positive) return 'text-[#22C55E]'
  return 'text-[#0B1220]'
}

const iconWrapClass = (t: ActivityItem['transactionType']) =>
  t === 'withdrawal' ? 'bg-[#DCFCE7]' : 'bg-[#DBEAFE]'

const iconClass = (t: ActivityItem['transactionType']) => (t === 'withdrawal' ? '' : '-rotate-45')

const iconForType = (t: ActivityItem['transactionType']) =>
  t === 'withdrawal' ? activityTrendIcon : activityArrowIcon

const searchableText = (item: ActivityItem) => {
  const amountDigits = item.amount.replace(/\D/g, '')
  const typeKeywords =
    item.transactionType === 'deposit'
      ? 'deposit deposits invest invested investing'
      : 'withdraw withdrawal withdrawing earned earnings'
  return [item.titlePrefix, item.poolName, item.date, item.amount, amountDigits, item.transactionType, typeKeywords]
    .join(' ')
    .toLowerCase()
}

const itemMatchesQuery = (haystack: string, query: string) => {
  const tokens = query.split(/\s+/).filter(Boolean)
  return tokens.every((token) => {
    if (haystack.includes(token)) return true
    const tokenDigits = token.replace(/\D/g, '')
    if (tokenDigits.length > 0) {
      const haystackDigits = haystack.replace(/\D/g, '')
      if (haystackDigits.includes(tokenDigits)) return true
    }
    return false
  })
}

const InvestorProfileHistoryTabContent = () => {
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const accessToken = useAppSelector((s) => s.auth.accessToken)

  const txQuery = useQuery({
    queryKey: ['investor-transactions', accessToken],
    enabled: Boolean(accessToken?.trim()),
    staleTime: 15_000,
    queryFn: async () => await fetchInvestorTransactions(accessToken),
  })

  const items = useMemo((): ActivityItem[] => {
    const poolName = 'Fist Commerce Pool'
    const explorerBase = getDefaultSepoliaBlockExplorerBase()
    const txs = (txQuery.data ?? []) as InvestorTransactionApi[]

    return txs
      .map((tx, idx) => {
        const rawType = String(tx.transaction_type ?? '').trim().toLowerCase()
        const txType: ActivityItem['transactionType'] =
          rawType.includes('deposit') ? 'deposit' : rawType.includes('withdraw') ? 'withdrawal' : 'deposit'

        const titlePrefix = txType === 'deposit' ? 'Invested in' : 'Earned from'

        const dt = new Date(tx.timestamp)
        const date = Number.isNaN(dt.getTime())
          ? String(tx.timestamp ?? '').trim() || '—'
          : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

        const baseAmount = formatUsdWholeFloorTowardZero(String(tx.amount ?? ''))
        const positive = txType === 'withdrawal'
        const amount = positive ? `+${baseAmount}` : baseAmount

        const explorerHref =
          explorerBase && tx.transaction_hash ? blockExplorerTxUrl(explorerBase, tx.transaction_hash) : null

        return {
          id: tx.transaction_hash?.trim() || `tx-${idx}`,
          transactionType: txType,
          titlePrefix,
          poolName,
          date,
          amount,
          positive,
          explorerHref,
        }
      })
      .filter(Boolean)
  }, [txQuery.data])

  const filteredItems = useMemo(() => {
    const byType =
      filter === 'withdrawals'
        ? items.filter((item) => item.transactionType === 'withdrawal')
        : filter === 'deposits'
          ? items.filter((item) => item.transactionType === 'deposit')
          : items

    const normalizedQuery = searchTerm.trim().toLowerCase()
    if (!normalizedQuery) return byType

    return byType.filter((item) => itemMatchesQuery(searchableText(item), normalizedQuery))
  }, [filter, searchTerm])

  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-[#4D5D80] text-[34px] font-semibold leading-tight">All Activities</h2>
        <div className="h-[46px] w-full sm:w-[330px] rounded-[6px] border border-[#D5DAE2] px-4 text-[14px] text-[#8B92A3] flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for a receivable"
            className="w-full bg-transparent outline-none text-[#4D5D80] placeholder:text-[#B0B7C4]"
            aria-label="Search receivables"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`h-[40px] min-w-[60px] rounded-[4px] px-4 text-[14px] font-medium ${
            filter === 'all' ? 'bg-[#195EBC] text-white' : 'bg-[#F3F4F6] text-[#7B8395]'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('deposits')}
          className={`h-[40px] min-w-[94px] rounded-[4px] px-4 text-[14px] font-medium ${
            filter === 'deposits' ? 'bg-[#195EBC] text-white' : 'bg-[#F3F4F6] text-[#7B8395]'
          }`}
        >
          Deposits
        </button>
        <button
          type="button"
          onClick={() => setFilter('withdrawals')}
          className={`h-[40px] min-w-[112px] rounded-[4px] px-4 text-[14px] font-medium ${
            filter === 'withdrawals' ? 'bg-[#195EBC] text-white' : 'bg-[#F3F4F6] text-[#7B8395]'
          }`}
        >
          Withdrawals
        </button>
      </div>

      <div className="mt-4">
        {txQuery.isPending ? (
          <div className="border-t border-[#EDF0F4] py-8 text-center text-[#8B92A3] text-[14px]">
            Loading activities…
          </div>
        ) : txQuery.isError ? (
          <div className="border-t border-[#EDF0F4] py-8 text-center text-[#B91C1C] text-[14px]" role="alert">
            Could not load activities. Please try again.
          </div>
        ) : null}
        {filteredItems.map((item) => (
          <article key={item.id} className="border-t border-[#EDF0F4] first:border-t-0 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-[6px] ${iconWrapClass(item.transactionType)} flex items-center justify-center shrink-0`}>
                  <img
                    src={iconForType(item.transactionType)}
                    alt=""
                    className={`h-4 w-4 object-contain ${iconClass(item.transactionType)}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[#0B1220] text-[16px] leading-tight">
                    {item.titlePrefix} <span className="font-semibold">{item.poolName}</span>
                  </p>
                  <p className="mt-1 text-[#8B92A3] text-[14px]">{item.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pl-3">
                <p className={`text-[32px] font-medium leading-tight ${amountClass(item)}`}>{item.amount}</p>
                {item.explorerHref ? (
                  <a
                    href={item.explorerHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                    aria-label="View transaction"
                  >
                    <img src={activityArrowIcon} alt="" className="h-4 w-4 object-contain -rotate-45 opacity-70" />
                  </a>
                ) : (
                  <img src={activityArrowIcon} alt="" className="h-4 w-4 object-contain -rotate-45 opacity-70" />
                )}
              </div>
            </div>
          </article>
        ))}
        {!txQuery.isPending && !txQuery.isError && filteredItems.length === 0 ? (
          <div className="border-t border-[#EDF0F4] py-8 text-center text-[#8B92A3] text-[14px]">
            No activities found for this receivable.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default InvestorProfileHistoryTabContent
