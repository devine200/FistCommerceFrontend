import type { AppDispatch } from '@/store'
import { ADMIN_LOGIN_PATH } from '@/auth/adminSession'
import { resetAuth } from '@/store/slices/authSlice'
import { resetAdminContactSocialLinks } from '@/store/slices/adminContactSocialLinksSlice'
import { resetAdminDashboard } from '@/store/slices/adminDashboardSlice'
import { resetAdminInvestors } from '@/store/slices/adminInvestorsSlice'
import { resetAdminLoanMonitoring } from '@/store/slices/adminLoanMonitoringSlice'
import { resetAdminMerchants } from '@/store/slices/adminMerchantsSlice'
import { resetAdminMultisig } from '@/store/slices/adminMultisigSlice'
import { resetAdminPayoutWithdrawals } from '@/store/slices/adminPayoutWithdrawalsSlice'
import { resetAdminReceivables } from '@/store/slices/adminReceivablesSlice'
import { resetAdminServicerWallet } from '@/store/slices/adminServicerWalletSlice'
import { resetAdminTransactions } from '@/store/slices/adminTransactionsSlice'

/** Clears admin auth + cached admin dashboard data and redirects to admin login. */
export async function logoutAdminSession(dispatch: AppDispatch): Promise<void> {
  dispatch(resetAuth())
  dispatch(resetAdminDashboard())
  dispatch(resetAdminInvestors())
  dispatch(resetAdminMerchants())
  dispatch(resetAdminReceivables())
  dispatch(resetAdminPayoutWithdrawals())
  dispatch(resetAdminLoanMonitoring())
  dispatch(resetAdminMultisig())
  dispatch(resetAdminServicerWallet())
  dispatch(resetAdminTransactions())
  dispatch(resetAdminContactSocialLinks())

  const { persistor } = await import('@/store')
  await persistor.flush()
  window.location.assign(ADMIN_LOGIN_PATH)
}
