import activityArrowIcon from '@/assets/arrow.png'
import repayIcon from '@/assets/repay Icon (5).png'
import primeChevronRight from '@/assets/prime_chevron-right.png'
import { useMemo, useState } from 'react'

type MerchantActivityKind = 'withdrawal' | 'repayment' | 'loan'

type MerchantActivityItem = {
  id: string
  kind: MerchantActivityKind
  date: string
  amount: string
  amountTone: 'default' | 'negative'
  withdrawalToLabel?: string
  withdrawalAmountPhrase?: string
  repaymentAmountPhrase?: string
  poolName?: string
}

const MERCHANT_ACTIVITIES: MerchantActivityItem[] = [
  {
    id: 'm-1',
    kind: 'withdrawal',
    withdrawalAmountPhrase: '$5000',
    withdrawalToLabel: 'Wallet',
    date: 'Mar 8, 2026',
    amount: '$5,000',
    amountTone: 'default',
  },
  {
    id: 'm-2',
    kind: 'withdrawal',
    withdrawalAmountPhrase: '$5000',
    withdrawalToLabel: 'Wallet',
    date: 'Mar 8, 2026',
    amount: '$5,000',
    amountTone: 'default',
  },
  {
    id: 'm-3',
    kind: 'repayment',
    repaymentAmountPhrase: '$7000',
    poolName: 'Fist Commerce Pool',
    date: 'Feb 20, 2026',
    amount: '$15,000',
    amountTone: 'default',
  },
  {
    id: 'm-4',
    kind: 'loan',
    poolName: 'Fist Commerce Pool',
    date: 'Feb 14, 2026',
    amount: '-$2,500',
    amountTone: 'negative',
  },
]

type ActivityFilter = 'all' | 'loans' | 'withdrawals' | 'repayments'

const amountClass = (item: MerchantActivityItem) =>
  item.amountTone === 'negative' ? 'text-[#EA580C]' : 'text-[#0B1220]'

const iconWrapClass = (kind: MerchantActivityKind) => {
  if (kind === 'withdrawal') return 'bg-[#DBEAFE]'
  if (kind === 'repayment') return 'bg-[#FFEDD5]'
  return 'bg-[#FEE2E2]'
}

const searchableText = (item: MerchantActivityItem) => {
  const amountDigits = item.amount.replace(/\D/g, '')
  const phraseDigits = [item.withdrawalAmountPhrase, item.repaymentAmountPhrase]
    .filter(Boolean)
    .map((s) => s!.replace(/\D/g, ''))
    .join(' ')
  const kindKeywords =
    item.kind === 'withdrawal'
      ? 'withdraw withdrawal wallet'
      : item.kind === 'repayment'
        ? 'repay repaid repayment'
        : 'loan borrow borrowed borrowing'
  const parts = [
    item.date,
    item.amount,
    amountDigits,
    phraseDigits,
    item.kind,
    kindKeywords,
    item.poolName,
    item.withdrawalToLabel,
    item.withdrawalAmountPhrase,
    item.repaymentAmountPhrase,
  ]
  return parts.filter(Boolean).join(' ').toLowerCase()
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

const MerchantProfileActivitiesTabContent = () => {
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    const byKind =
      filter === 'loans'
        ? MERCHANT_ACTIVITIES.filter((i) => i.kind === 'loan')
        : filter === 'withdrawals'
          ? MERCHANT_ACTIVITIES.filter((i) => i.kind === 'withdrawal')
          : filter === 'repayments'
            ? MERCHANT_ACTIVITIES.filter((i) => i.kind === 'repayment')
            : MERCHANT_ACTIVITIES

    const normalizedQuery = searchTerm.trim().toLowerCase()
    if (!normalizedQuery) return byKind

    return byKind.filter((item) => itemMatchesQuery(searchableText(item), normalizedQuery))
  }, [filter, searchTerm])

  const renderTitle = (item: MerchantActivityItem) => {
    if (item.kind === 'withdrawal') {
      return (
        <p className="text-[#0B1220] text-[16px] leading-tight">
          Withdrawal of {item.withdrawalAmountPhrase} to <span className="font-semibold">{item.withdrawalToLabel}</span>
        </p>
      )
    }
    if (item.kind === 'repayment') {
      return (
        <p className="text-[#0B1220] text-[16px] leading-tight">
          Repaid {item.repaymentAmountPhrase} in <span className="font-semibold">{item.poolName}</span>
        </p>
      )
    }
    return (
      <p className="text-[#0B1220] text-[16px] leading-tight">
        Borrowed from <span className="font-semibold">{item.poolName}</span>
      </p>
    )
  }

  const renderIcon = (item: MerchantActivityItem) => {
    if (item.kind === 'withdrawal') {
      return <img src={activityArrowIcon} alt="" className="h-4 w-4 object-contain -rotate-45" />
    }
    if (item.kind === 'repayment') {
      return <img src={repayIcon} alt="" className="h-5 w-5 object-contain" />
    }
    return <img src={activityArrowIcon} alt="" className="h-4 w-4 object-contain rotate-135" />
  }

  const filterButtonClass = (active: boolean) =>
    `h-[40px] rounded-[4px] px-4 text-[14px] font-medium whitespace-nowrap ${
      active ? 'bg-[#195EBC] text-white' : 'bg-[#F3F4F6] text-[#7B8395]'
    }`

  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-[#4D5D80] text-[34px] font-semibold leading-tight">All Activities</h2>
        <div className="h-[46px] w-full sm:w-[330px] rounded-[6px] border border-[#D5DAE2] px-4 text-[14px] text-[#8B92A3] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#B0B7C4]" aria-hidden>
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for a receivable"
            className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] placeholder:text-[#B0B7C4]"
            aria-label="Search receivables"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setFilter('all')} className={filterButtonClass(filter === 'all')}>
          All
        </button>
        <button type="button" onClick={() => setFilter('loans')} className={filterButtonClass(filter === 'loans')}>
          Loans
        </button>
        <button
          type="button"
          onClick={() => setFilter('withdrawals')}
          className={filterButtonClass(filter === 'withdrawals')}
        >
          Withdrawals
        </button>
        <button
          type="button"
          onClick={() => setFilter('repayments')}
          className={filterButtonClass(filter === 'repayments')}
        >
          Repayments
        </button>
      </div>

      <div className="mt-5">
        {filteredItems.map((item) => (
          <article key={item.id} className="border-t border-[#EDF0F4] first:border-t-0 py-5">
            <button
              type="button"
              className="w-full flex items-start justify-between gap-3 text-left rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#195EBC]/40"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`h-12 w-12 rounded-[8px] ${iconWrapClass(item.kind)} flex items-center justify-center shrink-0`}
                >
                  {renderIcon(item)}
                </div>
                <div className="min-w-0 pt-0.5">
                  {renderTitle(item)}
                  <p className="mt-1.5 text-[#8B92A3] text-[14px]">{item.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pl-2 pt-1">
                <p className={`text-[32px] font-medium leading-tight ${amountClass(item)}`}>{item.amount}</p>
                <img src={primeChevronRight} alt="" className="h-4 w-4 object-contain opacity-80" />
              </div>
            </button>
          </article>
        ))}
        {filteredItems.length === 0 ? (
          <div className="border-t border-[#EDF0F4] py-10 text-center text-[#8B92A3] text-[14px]">
            No activities found for this receivable.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default MerchantProfileActivitiesTabContent
