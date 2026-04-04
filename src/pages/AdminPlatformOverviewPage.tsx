import adminIconDollar1 from '@/assets/admin-icon-dollar-1.png'
import adminIconDollar2 from '@/assets/admin-icon-dollar-2.png'
import adminIconCoin from '@/assets/admin-icon-coin.png'
import moneyIcon from '@/assets/Money.png'
import primeChevronRight from '@/assets/prime_chevron-right.png'
import adminActivityRepayment from '@/assets/admin-activity-repayment.png'
import adminActivityDisbursement from '@/assets/admin-activity-disbursement.png'
import adminActivityReceivable from '@/assets/admin-activity-receivable.png'
import adminActivityUser from '@/assets/admin-activity-user.png'
import AdminOverviewCharts from '@/components/admin/AdminOverviewCharts'

/** Each row: dollar → coins → dollar → banknote (matches platform overview mock). */
const METRIC_CARDS: Array<{
  title: string
  value: string
  trend: string
  iconSrc: string
  iconClass?: string
}> = [
  { title: 'Total Value Locked', value: '$48.2M', trend: '+12.4%', iconSrc: adminIconDollar1 },
  { title: 'Total Active Loans', value: '343', trend: '+12.4%', iconSrc: adminIconCoin },
  { title: 'Total Investors', value: '1,543', trend: '+12.4%', iconSrc: adminIconDollar2 },
  { title: 'Total Merchants', value: '126', trend: '+12.4%', iconSrc: moneyIcon },
  { title: 'Capital Deployed', value: '$48.2M', trend: '+12.4%', iconSrc: adminIconDollar1 },
  { title: 'Repayments Collected', value: '343', trend: '+12.4%', iconSrc: adminIconCoin },
  { title: 'Default Rate', value: '1,543', trend: '+12.4%', iconSrc: adminIconDollar2 },
  { title: 'Platform Revenue', value: '126', trend: '+12.4%', iconSrc: moneyIcon },
]

/** Narrow screens: 2×4 grid reading order (left then right per row) — matches mobile admin spec */
const METRIC_MOBILE_ORDER = [1, 0, 2, 3, 4, 5, 6, 7] as const

type MetricCard = (typeof METRIC_CARDS)[number]

function MetricBlock({ card }: { card: MetricCard }) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-11 w-11 shrink-0 rounded-[6px] bg-[#195EBC] flex items-center justify-center">
          <img
            src={card.iconSrc}
            alt=""
            className={card.iconClass ?? 'h-5 w-5 object-contain brightness-0 invert'}
          />
        </div>
        <p className="text-[#0B1220] text-[14px] font-medium leading-tight">{card.title}</p>
      </div>
      <p className="text-[#0B1220] text-[22px] font-semibold leading-tight">{card.value}</p>
      <p className="text-[#16A34A] text-[12px] font-semibold flex items-center gap-1">
        <span className="text-[13px]" aria-hidden>
          ↗
        </span>
        <span>{card.trend}</span>
      </p>
    </div>
  )
}

const ACTIVITY_ICON_24 = 'w-6 h-6 object-contain'

const ACTIVITIES: Array<{
  title: string
  subtitle: string
  date: string
  iconSrc: string
  iconBgClass: string
}> = [
  {
    title: 'Loan Repaid',
    subtitle: '$5,500',
    date: 'Mar 8, 2026',
    iconSrc: adminActivityRepayment,
    iconBgClass: 'bg-[#F3F7FC]',
  },
  {
    title: 'Loan Disbursed',
    subtitle: '$5,000',
    date: 'Mar 8, 2026',
    iconSrc: adminActivityDisbursement,
    iconBgClass: 'bg-[#E7F6EC]',
  },
  {
    title: 'Receivable Verified',
    subtitle: 'Slippers Bulk Order',
    date: 'Mar 8, 2026',
    iconSrc: adminActivityReceivable,
    iconBgClass: 'bg-[#FFF0E5]',
  },
  {
    title: 'New Investor Approved',
    subtitle: 'Jonah Will',
    date: 'Mar 8, 2026',
    iconSrc: adminActivityUser,
    iconBgClass: 'bg-[#F3F7FC]',
  },
  {
    title: 'New Merchant Approved',
    subtitle: 'TechFlow Solutions',
    date: 'Mar 8, 2026',
    iconSrc: adminActivityUser,
    iconBgClass: 'bg-[#F3F7FC]',
  },
]

const AdminPlatformOverviewPage = () => {
  return (
    <div className="flex flex-col gap-6 pb-10 w-full max-w-[1280px] mx-auto">
      <section
        className="xl:hidden rounded-[10px] border border-[#E6E8EC] bg-white p-5 shadow-sm grid grid-cols-2 gap-x-4 gap-y-6"
        aria-label="Platform metrics"
      >
        {METRIC_MOBILE_ORDER.map((index) => {
          const card = METRIC_CARDS[index]
          return <MetricBlock key={card.title} card={card} />
        })}
      </section>

      <section className="hidden xl:grid grid-cols-4 gap-4" aria-label="Platform metrics">
        {METRIC_CARDS.map((card) => (
          <article
            key={card.title}
            className="rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 shadow-sm"
          >
            <MetricBlock card={card} />
          </article>
        ))}
      </section>

      <AdminOverviewCharts />

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#EDF0F4]">
          <h2 className="text-[#0B1220] font-bold text-[18px]">Recent Activities</h2>
        </div>
        <ul className="divide-y divide-[#EDF0F4]">
          {ACTIVITIES.map((row) => (
            <li key={`${row.title}-${row.subtitle}`}>
              <button
                type="button"
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F8FAFC] transition-colors"
              >
                <span
                  className={[
                    'h-10 w-10 rounded-[8px] shrink-0 flex items-center justify-center',
                    row.iconBgClass,
                  ].join(' ')}
                  aria-hidden
                >
                  <img src={row.iconSrc} alt="" className={ACTIVITY_ICON_24} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0B1220] text-[14px] font-semibold leading-tight">{row.title}</p>
                  <p className="text-[#6B7488] text-[13px] mt-1 truncate leading-tight">{row.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#8B92A3] text-[12px]">{row.date}</span>
                  <img src={primeChevronRight} alt="" className="h-4 w-4 object-contain opacity-70" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default AdminPlatformOverviewPage
