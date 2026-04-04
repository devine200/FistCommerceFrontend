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

const TVL_DATA = [
  { month: 'Sep', value: 38 },
  { month: 'Oct', value: 42 },
  { month: 'Nov', value: 45 },
  { month: 'Dec', value: 44 },
  { month: 'Jan', value: 47 },
  { month: 'Feb', value: 49 },
  { month: 'Mar', value: 48 },
]

const LOAN_VOLUME_DATA = [
  { month: 'Sep', value: 12 },
  { month: 'Oct', value: 18 },
  { month: 'Nov', value: 22 },
  { month: 'Dec', value: 19 },
  { month: 'Jan', value: 28 },
  { month: 'Feb', value: 31 },
  { month: 'Mar', value: 29 },
]

const CHART_H = 280

const AdminOverviewCharts = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section className="rounded-[10px] border border-[#E6E8EC] bg-white p-5 shadow-sm">
        <h2 className="text-[#0B1220] font-bold text-[16px]">Total Value Locked</h2>
        <p className="text-[#6B7488] text-[12px] mt-0.5">Rolling platform TVL (USDT, millions)</p>
        <div className="mt-4 w-full min-w-0" style={{ height: CHART_H }}>
          <ResponsiveContainer width="100%" height={CHART_H} minWidth={0}>
            <AreaChart data={TVL_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                domain={[0, 60]}
                ticks={[0, 15, 30, 45, 60]}
                tickFormatter={(v) => `$${v}M`}
                tick={{ fill: '#6B7488', fontSize: 12 }}
                axisLine={{ stroke: '#E6E8EC' }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value)
                  return [`$${Number.isFinite(n) ? n : '—'}M`, 'TVL']
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
        <h2 className="text-[#0B1220] font-bold text-[16px]">Loan Volume</h2>
        <p className="text-[#6B7488] text-[12px] mt-0.5">Disbursements by month (USDT, millions)</p>
        <div className="mt-4 w-full min-w-0" style={{ height: CHART_H }}>
          <ResponsiveContainer width="100%" height={CHART_H} minWidth={0}>
            <BarChart data={LOAN_VOLUME_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                domain={[0, 60]}
                ticks={[0, 15, 30, 45, 60]}
                tickFormatter={(v) => `$${v}M`}
                tick={{ fill: '#6B7488', fontSize: 12 }}
                axisLine={{ stroke: '#E6E8EC' }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value)
                  return [`$${Number.isFinite(n) ? n : '—'}M`, 'Volume']
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
