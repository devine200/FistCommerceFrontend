import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** Preset monthly APY-style performance (%) for demo chart */
const PERFORMANCE_DATA = [
  { month: 'Jan', value: 5.2 },
  { month: 'Feb', value: 6.1 },
  { month: 'Mar', value: 7.4 },
  { month: 'Apr', value: 8.2 },
  { month: 'May', value: 9.1 },
  { month: 'Jun', value: 10.4 },
  { month: 'Jul', value: 11.2 },
  { month: 'Aug', value: 12.0 },
  { month: 'Sep', value: 12.8 },
  { month: 'Oct', value: 13.5 },
  { month: 'Nov', value: 14.2 },
  { month: 'Dec', value: 15.0 },
]

const CHART_HEIGHT = 280

const InvestorPoolPerformanceChart = () => {
  return (
    <div className="mt-4 w-full min-w-0 shrink-0" style={{ height: CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
        <AreaChart data={PERFORMANCE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="investorPoolApyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#195EBC" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#195EBC" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#6B7488', fontSize: 12 }} axisLine={{ stroke: '#E6E8EC' }} tickLine={false} />
          <YAxis
            domain={[0, 16]}
            ticks={[0, 4, 8, 12, 16]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#6B7488', fontSize: 12 }}
            axisLine={{ stroke: '#E6E8EC' }}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value) => {
              const n = typeof value === 'number' ? value : Number(value)
              return [`${Number.isFinite(n) ? n : '—'}%`, 'Performance']
            }}
            labelFormatter={(label) => label}
            contentStyle={{ borderRadius: 8, border: '1px solid #E6E8EC' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#195EBC"
            strokeWidth={2}
            fill="url(#investorPoolApyFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#195EBC' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default InvestorPoolPerformanceChart
