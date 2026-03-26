import activityArrowIcon from '@/assets/arrow.png'
import activityTrendIcon from '@/assets/Vector.png'
import { useMemo, useState } from 'react'

type HistoryType = 'invest' | 'earn' | 'withdraw'

type ActivityItem = {
  id: string
  type: HistoryType
  titlePrefix: string
  poolName: string
  date: string
  amount: string
  positive?: boolean
}

type ActivityFilter = 'all' | 'deposits' | 'withdrawals'

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'invest',
    titlePrefix: 'Invested in',
    poolName: 'Fist Commerce Pool',
    date: 'Mar 8, 2026',
    amount: '$5,000',
  },
  {
    id: 'act-2',
    type: 'earn',
    titlePrefix: 'Earned from',
    poolName: 'Fist Commerce Pool',
    date: 'Mar 5, 2026',
    amount: '+$340',
    positive: true,
  },
  {
    id: 'act-3',
    type: 'invest',
    titlePrefix: 'Invested in',
    poolName: 'Fist Commerce Pool',
    date: 'Feb 20, 2026',
    amount: '$15,000',
  },
  {
    id: 'act-4',
    type: 'withdraw',
    titlePrefix: 'Withdrawal from',
    poolName: 'Fist Commerce Pool',
    date: 'Feb 14, 2026',
    amount: '-$2,500',
  },
]

const iconWrapClass = (type: HistoryType) => {
  if (type === 'earn') return 'bg-[#DCFCE7]'
  return 'bg-[#DBEAFE]'
}

const iconClass = (type: HistoryType) => {
  if (type === 'earn') return ''
  return '-rotate-45'
}

const amountClass = (item: ActivityItem) => {
  if (item.positive) return 'text-[#22C55E]'
  if (item.type === 'withdraw') return 'text-[#F97316]'
  return 'text-[#0B1220]'
}

const iconForType = (type: HistoryType) => {
  if (type === 'earn') return activityTrendIcon
  return activityArrowIcon
}

const searchableText = (item: ActivityItem) => {
  const amountDigits = item.amount.replace(/\D/g, '')
  const typeKeywords =
    item.type === 'invest'
      ? 'deposit deposits invest invested investing'
      : item.type === 'withdraw'
        ? 'withdraw withdrawal withdrawing'
        : 'earn earned earnings'
  return [item.titlePrefix, item.poolName, item.date, item.amount, amountDigits, item.type, typeKeywords]
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

  const filteredItems = useMemo(() => {
    const byType =
      filter === 'withdrawals'
        ? ACTIVITY_ITEMS.filter((item) => item.type === 'withdraw')
        : filter === 'deposits'
          ? ACTIVITY_ITEMS.filter((item) => item.type === 'invest' || item.type === 'earn')
          : ACTIVITY_ITEMS

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
        {filteredItems.map((item) => (
          <article key={item.id} className="border-t border-[#EDF0F4] first:border-t-0 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-[6px] ${iconWrapClass(item.type)} flex items-center justify-center shrink-0`}>
                  <img src={iconForType(item.type)} alt="" className={`h-4 w-4 object-contain ${iconClass(item.type)}`} />
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
                <img src={activityArrowIcon} alt="" className="h-4 w-4 object-contain -rotate-45 opacity-70" />
              </div>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 ? (
          <div className="border-t border-[#EDF0F4] py-8 text-center text-[#8B92A3] text-[14px]">
            No activities found for this receivable.
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default InvestorProfileHistoryTabContent
