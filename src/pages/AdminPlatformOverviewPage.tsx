import primeChevronRight from '@/assets/prime_chevron-right.png'
import AdminOverviewCharts from '@/components/admin/AdminOverviewCharts'
import AdminPageFrame from '@/components/admin/primitives/AdminPageFrame'
import AdminPanel from '@/components/admin/primitives/AdminPanel'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminDashboard, type AdminMetricCard } from '@/store/slices/adminDashboardSlice'

/** Narrow screens: 2×4 grid reading order (left then right per row) — matches mobile admin spec */
const METRIC_MOBILE_ORDER = [1, 0, 2, 3, 4, 5, 6, 7] as const

const ACTIVITY_ICON_24 = 'w-6 h-6 object-contain'

function MetricBlock({ card }: { card: AdminMetricCard }) {
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

const AdminPlatformOverviewPage = () => {
  const dispatch = useAppDispatch()
  const { metricCards, activities, status, lastUpdated, error } = useAppSelector((s) => s.adminDashboard)

  return (
    <AdminPageFrame>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <p className="text-[#6B7488] text-[13px]">
          {lastUpdated != null
            ? `Dashboard data last synced ${new Date(lastUpdated).toLocaleString()}`
            : 'Dashboard data not synced yet'}
          {error ? ` — ${error}` : null}
        </p>
        <button
          type="button"
          disabled={status === 'loading'}
          onClick={() => {
            void dispatch(refreshAdminDashboard())
          }}
          className="self-start sm:self-auto h-9 px-4 rounded-[6px] bg-[#195EBC] text-white text-[13px] font-medium hover:bg-[#154a9a] transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? 'Syncing…' : 'Sync dashboard data'}
        </button>
      </div>

      <section
        className="xl:hidden rounded-[10px] border border-[#E6E8EC] bg-white p-5 shadow-sm grid grid-cols-2 gap-x-4 gap-y-6"
        aria-label="Platform metrics"
      >
        {METRIC_MOBILE_ORDER.map((index) => {
          const card = metricCards[index]
          return <MetricBlock key={card.title} card={card} />
        })}
      </section>

      <section className="hidden xl:grid grid-cols-4 gap-4" aria-label="Platform metrics">
        {metricCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 shadow-sm"
          >
            <MetricBlock card={card} />
          </article>
        ))}
      </section>

      <AdminOverviewCharts />

      <AdminPanel>
        <div className="px-5 py-4 border-b border-[#EDF0F4]">
          <h2 className="text-[#0B1220] font-bold text-[18px]">Recent Activities</h2>
        </div>
        <ul className="divide-y divide-[#EDF0F4]">
          {activities.map((row) => (
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
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminPlatformOverviewPage
