import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import adminIconDollar1 from '@/assets/admin-icon-dollar-1.png'
import adminIconDollar2 from '@/assets/admin-icon-dollar-2.png'
import adminIconCoin from '@/assets/admin-icon-coin.png'
import moneyIcon from '@/assets/Money.png'
import adminActivityRepayment from '@/assets/admin-activity-repayment.png'
import adminActivityDisbursement from '@/assets/admin-activity-disbursement.png'
import adminActivityReceivable from '@/assets/admin-activity-receivable.png'
import adminActivityUser from '@/assets/admin-activity-user.png'

export type AdminMetricCard = {
  title: string
  value: string
  trend: string
  iconSrc: string
  iconClass?: string
}

export type AdminActivityRow = {
  title: string
  subtitle: string
  date: string
  iconSrc: string
  iconBgClass: string
}

export type AdminDashboardSyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AdminDashboardState = {
  metricCards: AdminMetricCard[]
  activities: AdminActivityRow[]
  status: AdminDashboardSyncStatus
  error: string | null
  lastUpdated: number | null
}

const initialMetricCards: AdminMetricCard[] = [
  { title: 'Total Value Locked', value: '$48.2M', trend: '+12.4%', iconSrc: adminIconDollar1 },
  { title: 'Total Active Loans', value: '343', trend: '+12.4%', iconSrc: adminIconCoin },
  { title: 'Total Investors', value: '1,543', trend: '+12.4%', iconSrc: adminIconDollar2 },
  { title: 'Total Merchants', value: '126', trend: '+12.4%', iconSrc: moneyIcon },
  { title: 'Capital Deployed', value: '$48.2M', trend: '+12.4%', iconSrc: adminIconDollar1 },
  { title: 'Repayments Collected', value: '343', trend: '+12.4%', iconSrc: adminIconCoin },
  { title: 'Default Rate', value: '1,543', trend: '+12.4%', iconSrc: adminIconDollar2 },
  { title: 'Platform Revenue', value: '126', trend: '+12.4%', iconSrc: moneyIcon },
]

const initialActivities: AdminActivityRow[] = [
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

const initialState: AdminDashboardState = {
  metricCards: initialMetricCards,
  activities: initialActivities,
  status: 'idle',
  error: null,
  lastUpdated: null,
}

export const refreshAdminDashboard = createAsyncThunk('adminDashboard/refresh', async () => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 450)
  })
  return { refreshedAt: Date.now() }
})

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setAdminMetricValue: (
      state,
      action: PayloadAction<{ index: number; value: string }>,
    ) => {
      const { index, value } = action.payload
      const card = state.metricCards[index]
      if (card) card.value = value
    },
    setAdminActivities: (state, action: PayloadAction<AdminActivityRow[]>) => {
      state.activities = action.payload
    },
    resetAdminDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAdminDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshAdminDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastUpdated = action.payload.refreshedAt
      })
      .addCase(refreshAdminDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = typeof action.payload === 'string' ? action.payload : 'Refresh failed'
      })
  },
})

export const { setAdminMetricValue, setAdminActivities, resetAdminDashboard } =
  adminDashboardSlice.actions
export const adminDashboardReducer = adminDashboardSlice.reducer
