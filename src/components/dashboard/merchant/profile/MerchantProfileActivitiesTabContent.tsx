import activityArrowIcon from '@/assets/arrow.png'
import repayIcon from '@/assets/repay Icon (5).png'
import primeChevronRight from '@/assets/prime_chevron-right.png'
import { ListPagination } from '@/components/shared/ListPagination'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { convertTimestampToDate, type MerchantTransactionApi } from '@/api/metrics'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import { useListPageState } from '@/hooks/useListPageState'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectMerchantLendingPoolTitle } from '@/store/selectors/merchantDashboardSelectors'
import { selectIsKycVerified } from '@/store/selectors/sessionSelectors'
import {
  merchantTransactionsListCacheKey,
  refreshMerchantTransactions,
} from '@/store/slices/merchantTransactionsSlice'
import { getListPaginationMeta, listPaginationOffset } from '@/utils/listPagination'

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
  receivableId?: string
}

function normalizeAmountLabel(amount: string): string {
  const a = amount.trim()
  if (!a) return '—'
  if (/^[+-]?\$/.test(a)) return a
  if (/^[+-]?\d/.test(a)) return `$${a}`
  return a
}

function floorTowardZero(n: number): number {
  return n >= 0 ? Math.floor(n) : Math.ceil(n)
}

function normalizeAmountLabelWholeDollars(amount: string): string {
  const a = amount.trim()
  if (!a) return '—'
  const cleaned = a.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return normalizeAmountLabel(a)
  const floored = floorTowardZero(n)
  return floored.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function mapTransactionKind(t: string): MerchantActivityKind {
  const k = t.trim().toLowerCase()
  if (k.includes('withdraw')) return 'withdrawal'
  if (k.includes('repaid') || k.includes('repay')) return 'repayment'
  if (k.includes('loan') || k.includes('borrow')) return 'loan'
  return 'loan'
}

function mapMerchantTransactionToActivity(tx: MerchantTransactionApi, poolName: string): MerchantActivityItem {
  const kind = mapTransactionKind(tx.transaction_type)
  const amountLabel = normalizeAmountLabelWholeDollars(tx.amount)

  return {
    id: tx.transaction_hash,
    kind,
    date: convertTimestampToDate(tx.timestamp),
    amount: amountLabel,
    amountTone: amountLabel.trim().startsWith('-') ? 'negative' : 'default',
    withdrawalToLabel: kind === 'withdrawal' ? 'Wallet' : undefined,
    withdrawalAmountPhrase: kind === 'withdrawal' ? amountLabel : undefined,
    repaymentAmountPhrase: kind === 'repayment' ? amountLabel : undefined,
    poolName: kind === 'withdrawal' ? undefined : poolName,
    receivableId: tx.receivable_id?.trim() || undefined,
  }
}

type ActivityFilter = 'all' | 'loans' | 'withdrawals' | 'repayments'

function filterToApiType(filter: ActivityFilter): 'all' | 'loan' | 'withdrawal' | 'repayment' {
  if (filter === 'loans') return 'loan'
  if (filter === 'withdrawals') return 'withdrawal'
  if (filter === 'repayments') return 'repayment'
  return 'all'
}

const amountClass = (item: MerchantActivityItem) =>
  item.amountTone === 'negative' ? 'text-[#EA580C]' : 'text-[#0B1220]'

const iconWrapClass = (kind: MerchantActivityKind) => {
  if (kind === 'withdrawal') return 'bg-[#DBEAFE]'
  if (kind === 'repayment') return 'bg-[#FFEDD5]'
  return 'bg-[#FEE2E2]'
}

const MerchantProfileActivitiesTabContent = () => {
  const dispatch = useAppDispatch()
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const isKycVerified = useAppSelector(selectIsKycVerified)
  const txStatus = useAppSelector((s) => s.merchantTransactions.status)
  const txError = useAppSelector((s) => s.merchantTransactions.error)
  const txItems = useAppSelector((s) => s.merchantTransactions.items)
  const txTotal = useAppSelector((s) => s.merchantTransactions.total)
  const resultsCache = useAppSelector((s) => s.merchantTransactions.resultsCache)
  const poolName = useAppSelector(selectMerchantLendingPoolTitle) || 'Fist Commerce Pool'
  const [page, setPage] = useListPageState([filter, searchDebounced])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const apiType = filterToApiType(filter)
  const offset = listPaginationOffset(page)
  const pageQuery = useMemo(
    () => ({
      type: apiType,
      search: searchDebounced || undefined,
      limit: DASHBOARD_LIST_PAGE_SIZE,
      offset,
    }),
    [apiType, searchDebounced, offset],
  )
  const pageCacheKey = merchantTransactionsListCacheKey(pageQuery)
  const hasPageCache = Object.prototype.hasOwnProperty.call(resultsCache, pageCacheKey)

  const refreshPage = useCallback(
    (background: boolean) => {
      void dispatch(
        refreshMerchantTransactions({
          ...pageQuery,
          background,
        }),
      )
    },
    [dispatch, pageQuery],
  )

  useEffect(() => {
    if (!accessToken?.trim() || !isKycVerified) return
    refreshPage(hasPageCache)
  }, [accessToken, isKycVerified, refreshPage, hasPageCache])

  const pageItems = useMemo(
    () => txItems.map((tx) => mapMerchantTransactionToActivity(tx, poolName)),
    [txItems, poolName],
  )

  const meta = useMemo(() => getListPaginationMeta(txTotal, page), [txTotal, page])

  const tableLoading = txStatus === 'loading' && pageItems.length === 0 && !hasPageCache
  const emptyMessage = searchDebounced
    ? 'No activities match your search.'
    : filter !== 'all'
      ? 'No activities in this filter yet.'
      : 'No activities yet.'

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
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
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
        {tableLoading ? (
          <div className="border-t border-[#EDF0F4] py-10 text-center text-[#8B92A3] text-[14px]" role="status">
            Loading activities…
          </div>
        ) : null}
        {txStatus === 'failed' && txError ? (
          <div className="border-t border-[#EDF0F4] py-10 text-center text-[#B91C1C] text-[14px]" role="alert">
            {txError}
          </div>
        ) : null}
        {pageItems.map((item) => (
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
        {!tableLoading && txStatus !== 'failed' && pageItems.length === 0 ? (
          <div className="border-t border-[#EDF0F4] py-10 text-center text-[#8B92A3] text-[14px]">
            {emptyMessage}
          </div>
        ) : null}
        <ListPagination
          meta={meta}
          onPageChange={setPage}
          loading={txStatus === 'loading'}
          variant="dashboard"
          className="border-t border-[#EDF0F4]"
        />
      </div>
    </section>
  )
}

export default MerchantProfileActivitiesTabContent
