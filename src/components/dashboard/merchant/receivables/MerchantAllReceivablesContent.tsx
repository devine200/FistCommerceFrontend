import moneyIcon from '@/assets/Money.png'
import dollarIcon from '@/assets/CurrencyDollarSimple.png'
import primeChevronRight from '@/assets/prime_chevron-right.png'
import magnifyingGlassIcon from '@/assets/MagnifyingGlass.png'
import type { ReceivableSummaryCard, ReceivableTableRow } from '@/components/dashboard/merchant/receivables/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

const summaryIconSrc = (card: ReceivableSummaryCard) => (card.icon === 'dollar' ? dollarIcon : moneyIcon)

const repaymentDueClass = (variant: ReceivableTableRow['repaymentDueVariant']) => {
  if (variant === 'overdue') return 'text-[#DC2626] font-semibold'
  if (variant === 'repaid') return 'text-[#16A34A] font-semibold'
  return 'text-[#EA580C] font-semibold'
}

const debtStatusClass = (variant: ReceivableTableRow['debtStatusVariant']) => {
  if (variant === 'defaulted' || variant === 'repaid') return 'text-[#195EBC] font-semibold'
  return 'text-[#B45309] font-semibold'
}

const rowHaystack = (row: ReceivableTableRow) =>
  [
    row.receivableName,
    row.loanAmount,
    row.apr,
    row.repaymentDue,
    row.repaymentAmount,
    row.interestSubline,
    row.debtStatus,
    row.loanAmount.replace(/\D/g, ''),
    row.repaymentAmount.replace(/\D/g, ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const matchesSearch = (haystack: string, query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const tokens = q.split(/\s+/).filter(Boolean)
  return tokens.every((token) => {
    if (haystack.includes(token)) return true
    const tokenDigits = token.replace(/\D/g, '')
    if (tokenDigits.length > 0) {
      const digits = haystack.replace(/\D/g, '')
      if (digits.includes(tokenDigits)) return true
    }
    return false
  })
}

const MerchantAllReceivablesContent = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
  const { rows, status, error } = useAppSelector((s) => s.merchantReceivables)
  const totalCount = rows.length

  const summaryCards = useMemo((): ReceivableSummaryCard[] => {
    // Minimal summary from what we have on `/loan/request` today.
    const totalReceivables = rows.length
    const defaulted = rows.filter((r) => r.debtStatusVariant === 'defaulted').length
    const repaid = rows.filter((r) => r.debtStatusVariant === 'repaid').length
    const unpaid = rows.filter((r) => r.debtStatusVariant === 'unpaid').length

    return [
      {
        id: 'total-count',
        icon: 'money',
        title: 'Total Receivables',
        primaryValue: String(totalReceivables),
        secondaryValue: 'From your loan requests',
      },
      {
        id: 'unpaid',
        icon: 'dollar',
        title: 'Unpaid',
        primaryValue: String(unpaid),
        secondaryValue: 'Open receivables',
      },
      {
        id: 'repaid',
        icon: 'dollar',
        title: 'Repaid',
        primaryValue: String(repaid),
        secondaryValue: 'Closed receivables',
      },
      {
        id: 'defaulted',
        icon: 'money',
        title: 'Defaulted',
        primaryValue: String(defaulted),
        secondaryValue: 'Needs attention',
      },
    ]
  }, [rows])

  const goToReceivable = (id: string) => {
    navigate(`/dashboard/merchant/receivables/${id}`)
  }

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => matchesSearch(rowHaystack(row), q))
  }, [searchTerm, rows])

  useEffect(() => {
    if (!isMobileSearchOpen) return
    mobileSearchInputRef.current?.focus()
  }, [isMobileSearchOpen])

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Mobile header */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[#6B7488] text-[13px] inline-flex items-center gap-2 hover:text-[#195EBC]"
        >
          <span aria-hidden>←</span>
          Back
        </button>
      </div>

      {/* Desktop header */}
      <header className="hidden lg:block">
        <h1 className="text-[#0B1220] font-bold text-[28px] leading-tight">All Receivables</h1>
        <p className="text-[#6B7488] text-[16px] mt-1.5">View all your receivables</p>
      </header>

      {/* Mobile summary (single card, 2x2) */}
      <section className="lg:hidden rounded-[10px] border border-[#E6E8EC] bg-white p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          {summaryCards.map((card) => (
            <div key={card.id} className="min-w-0">
              <p className="text-[#6B7488] text-[11px] leading-tight">{card.title}</p>
              <p className="text-[#0B1220] text-[16px] font-semibold mt-1">{card.primaryValue}</p>
              <p className="text-[#8B92A3] text-[11px] mt-0.5">{card.secondaryValue}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Desktop summary cards */}
      <section className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <article
            key={card.id}
            className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-[6px] bg-[#195EBC] flex items-center justify-center">
                <img src={summaryIconSrc(card)} alt="" className="h-5 w-5 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[#8B92A3] text-[13px] font-medium leading-tight">{card.title}</p>
                <p className="text-[#0B1220] text-[26px] font-semibold leading-tight mt-2">{card.primaryValue}</p>
                <p className="text-[#8B92A3] text-[12px] mt-1.5">{card.secondaryValue}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Mobile list */}
      <section className="lg:hidden rounded-[10px] border border-[#E6E8EC] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#EDF0F4]">
          <h2 className="text-[#0B1220] font-semibold text-[14px]">My Receivables ({totalCount})</h2>
          <button
            type="button"
            className="h-9 w-9 rounded-[6px] bg-[#195EBC] flex items-center justify-center"
            aria-label={isMobileSearchOpen ? 'Close search' : 'Search receivables'}
            onClick={() => setIsMobileSearchOpen((v) => !v)}
          >
            <img src={magnifyingGlassIcon} alt="" className="h-4 w-4 object-contain brightness-0 invert" />
          </button>
        </div>

        <div className="p-3">
          {status === 'loading' ? (
            <div className="px-2 py-8 text-center text-[#8B92A3] text-[13px]" role="status">
              Loading receivables…
            </div>
          ) : null}
          {status === 'failed' && error ? (
            <div className="px-2 py-8 text-center text-[#B91C1C] text-[13px]" role="alert">
              {error}
            </div>
          ) : null}
          {isMobileSearchOpen ? (
            <div className="mb-3">
              <div className="h-[42px] w-full rounded-[6px] border border-[#D5DAE2] px-3 flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-[#B0B7C4]"
                  aria-hidden
                >
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a receivable"
                  className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[13px] placeholder:text-[#B0B7C4]"
                  aria-label="Search receivables"
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {filteredRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => goToReceivable(row.id)}
                className={[
                  'w-full rounded-[6px] px-4 py-4 flex items-center justify-between gap-4 text-left',
                  row.rowEmphasis ? 'bg-[#EEF2F6]' : 'bg-white',
                ].join(' ')}
              >
                <div className="min-w-0">
                  <p className="text-[#0B1220] text-[13px] font-medium truncate">{row.receivableName}</p>
                  <p className="text-[#195EBC] text-[13px] font-semibold mt-1">{row.loanAmount}</p>
                </div>
                <img src={primeChevronRight} alt="" className="h-4 w-4 object-contain opacity-80 shrink-0" />
              </button>
            ))}
          </div>

          {filteredRows.length === 0 ? (
            <div className="px-2 py-10 text-center text-[#8B92A3] text-[13px]">No receivables match your search.</div>
          ) : null}
        </div>
      </section>

      {/* Desktop table */}
      <section className="hidden lg:block rounded-[10px] border border-[#E6E8EC] bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-8 py-6 border-b border-[#EDF0F4]">
          <h2 className="text-[#0B1220] font-bold text-[20px]">Receivables ({totalCount})</h2>
          <div className="h-[46px] w-full sm:w-[320px] rounded-[6px] border border-[#D5DAE2] px-4 flex items-center gap-2 shrink-0">
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
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a receivable"
              className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[14px] placeholder:text-[#B0B7C4]"
              aria-label="Search receivables"
            />
          </div>
        </div>

        <div className="overflow-x-auto px-8 pb-8 pt-4">
          {status === 'loading' ? (
            <div className="py-10 text-center text-[#8B92A3] text-[14px]" role="status">
              Loading receivables…
            </div>
          ) : null}
          {status === 'failed' && error ? (
            <div className="py-10 text-center text-[#B91C1C] text-[14px]" role="alert">
              {error}
            </div>
          ) : null}
          <table className="w-full min-w-[1000px] text-left text-[14px] border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#4D5D80] border-b border-[#E6E8EC]">
                <th className="px-8 py-5 font-semibold text-[13px]">Receivable Name</th>
                <th className="px-8 py-5 font-semibold text-[13px]">Loan Amount</th>
                <th className="px-8 py-5 font-semibold text-[13px]">APR</th>
                <th className="px-8 py-5 font-semibold text-[13px]">Repayment Due</th>
                <th className="px-8 py-5 font-semibold text-[13px]">Repayment Amount</th>
                <th className="px-8 py-5 font-semibold text-[13px]">Debt Status</th>
                <th className="px-8 py-5 font-semibold text-[13px] text-right w-[88px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => goToReceivable(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goToReceivable(row.id)
                    }
                  }}
                  className={`border-b border-[#EDF0F4] last:border-b-0 cursor-pointer transition-colors hover:bg-[#E8F2FC]/60 focus-visible:outline-2 focus-visible:outline-[#195EBC] focus-visible:-outline-offset-2 ${
                    row.rowEmphasis ? 'bg-[#EEF6FF]' : 'bg-white'
                  }`}
                >
                  <td className="px-8 py-6 text-[#0B1220] font-semibold">{row.receivableName}</td>
                  <td className="px-8 py-6 text-[#0B1220] font-medium">{row.loanAmount}</td>
                  <td className="px-8 py-6 text-[#3A4356]">{row.apr}</td>
                  <td className="px-8 py-6">
                    <span className={repaymentDueClass(row.repaymentDueVariant)}>{row.repaymentDue}</span>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <div className="text-[#0B1220] font-semibold">{row.repaymentAmount}</div>
                    {row.interestSubline ? (
                      <div className="text-[#195EBC] text-[12px] font-medium mt-1">{row.interestSubline}</div>
                    ) : null}
                  </td>
                  <td className="px-8 py-6">
                    <span className={debtStatusClass(row.debtStatusVariant)}>{row.debtStatus}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EFFB] text-[#195EBC] pointer-events-none"
                      aria-hidden
                    >
                      <img src={primeChevronRight} alt="" className="h-4 w-4 object-contain opacity-90" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status !== 'loading' && status !== 'failed' && filteredRows.length === 0 ? (
          <div className="px-8 py-12 text-center text-[#8B92A3] text-[14px] border-t border-[#EDF0F4]">
            No receivables match your search.
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default MerchantAllReceivablesContent
