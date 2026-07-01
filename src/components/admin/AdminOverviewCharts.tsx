import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { displayDashboardCompactUsd, displayDashboardMetricString, type AdminMetrics } from '@/api/metrics'
import {
  chartYAxisMaxMillions,
  type AdminChartRechartsPoint,
} from '@/utils/mapAdminMetricsOverview'

const CHART_H = 280

type AdminOverviewChartsProps = {
  adminMetrics: AdminMetrics | null
  tvlSeries: AdminChartRechartsPoint[]
  originatedSeries: AdminChartRechartsPoint[]
}

function formatTooltipAmount(rawAmount: string | null, valueMillions: number): string {
  if (rawAmount?.trim()) {
    return displayDashboardMetricString(rawAmount)
  }
  const n = typeof valueMillions === 'number' ? valueMillions : Number(valueMillions)
  if (!Number.isFinite(n)) return '—'
  return `$${n.toFixed(2)}M`
}

function yAxisTicks(max: number): number[] {
  if (max <= 1) return [0, 0.25, 0.5, 0.75, 1]
  const step = max <= 5 ? 1 : max / 4
  const ticks: number[] = [0]
  for (let v = step; v <= max; v += step) {
    ticks.push(Math.round(v * 100) / 100)
  }
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
}

const AdminOverviewCharts = ({
  adminMetrics,
  tvlSeries,
  originatedSeries,
}: AdminOverviewChartsProps) => {
  const tvlSnapshot = adminMetrics
    ? displayDashboardCompactUsd(adminMetrics.capital.tvl)
    : null
  const originatedSnapshot = adminMetrics
    ? displayDashboardCompactUsd(adminMetrics.credit.originatedPrincipal)
    : null

  const tvlYMax = useMemo(() => chartYAxisMaxMillions(tvlSeries), [tvlSeries])
  const originatedYMax = useMemo(() => chartYAxisMaxMillions(originatedSeries), [originatedSeries])

  const tvlChartData = tvlSeries.length > 0 ? tvlSeries : [{ month: '—', value: 0, rawAmount: null }]
  const originatedChartData =
    originatedSeries.length > 0 ? originatedSeries : [{ month: '—', value: 0, rawAmount: null }]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section className="rounded-[10px] border border-[#E6E8EC] bg-white p-5 shadow-sm">
        <h2 className="text-[#0B1220] font-bold text-[16px]">TVL</h2>
        <p className="text-[#6B7488] text-[12px] mt-0.5">
          {tvlSnapshot
            ? `Current protocol TVL: ${tvlSnapshot} · monthly history (USDT, millions)`
            : 'Monthly TVL history — sync dashboard data to load'}
        </p>
        <div className="mt-4 w-full min-w-0" style={{ height: CHART_H }}>
          <ResponsiveContainer width="100%" height={CHART_H} minWidth={0}>
            <AreaChart data={tvlChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adminTvlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#195EBC" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#195EBC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6B7488', fontSize: 12 }}
                axisLine={{ stroke: '#E6E8EC' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, tvlYMax]}
                ticks={yAxisTicks(tvlYMax)}
                tickFormatter={(v) => `$${v}M`}
                tick={{ fill: '#6B7488', fontSize: 12 }}
                axisLine={{ stroke: '#E6E8EC' }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value, _name, item) => {
                  const payload = item?.payload as AdminChartRechartsPoint | undefined
                  return [
                    formatTooltipAmount(payload?.rawAmount ?? null, Number(value)),
                    'TVL',
                  ]
                }}
                labelFormatter={(label) => String(label)}
                contentStyle={{ borderRadius: 8, border: '1px solid #E6E8EC' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#195EBC"
                strokeWidth={2}
                fill="url(#adminTvlFill)"
                dot={false}
                activeDot={{ r: 4, fill: '#195EBC' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-[10px] border border-[#E6E8EC] bg-white p-5 shadow-sm">
        <h2 className="text-[#0B1220] font-bold text-[16px]">Originated principal</h2>
        <p className="text-[#6B7488] text-[12px] mt-0.5">
          {originatedSnapshot
            ? `Total originated principal: ${originatedSnapshot} · monthly fundings (millions)`
            : 'Monthly originated principal — sync dashboard data to load'}
        </p>
        <div className="mt-4 w-full min-w-0" style={{ height: CHART_H }}>
          <ResponsiveContainer width="100%" height={CHART_H} minWidth={0}>
            <BarChart data={originatedChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adminBarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A6CC8" />
                  <stop offset="100%" stopColor="#73A4E7" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6B7488', fontSize: 12 }}
                axisLine={{ stroke: '#E6E8EC' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, originatedYMax]}
                ticks={yAxisTicks(originatedYMax)}
                tickFormatter={(v) => `$${v}M`}
                tick={{ fill: '#6B7488', fontSize: 12 }}
                axisLine={{ stroke: '#E6E8EC' }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value, _name, item) => {
                  const payload = item?.payload as AdminChartRechartsPoint | undefined
                  return [
                    formatTooltipAmount(payload?.rawAmount ?? null, Number(value)),
                    'Principal',
                  ]
                }}
                contentStyle={{ borderRadius: 8, border: '1px solid #E6E8EC' }}
              />
              <Bar dataKey="value" fill="url(#adminBarFill)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default AdminOverviewCharts
