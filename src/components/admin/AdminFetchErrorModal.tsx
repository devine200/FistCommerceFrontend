import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { GOVERNANCE_FULL_LIST_FILTER, governanceListCacheKey } from '@/admin/governance/governanceListCache'
import { DASHBOARD_LIST_PAGE_SIZE } from '@/constants/listPagination'
import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshAdminDashboard } from '@/store/slices/adminDashboardSlice'
import { refreshAdminInvestorProfile, refreshAdminInvestors } from '@/store/slices/adminInvestorsSlice'
import {
  clearAdminLoanMonitoringActionError,
  refreshAdminLoanMonitoring,
  refreshAdminLoanMonitoringDetail,
} from '@/store/slices/adminLoanMonitoringSlice'
import {
  refreshAdminMerchantProfile,
  refreshAdminMerchants,
} from '@/store/slices/adminMerchantsSlice'
import {
  clearAdminMultisigActionError,
  refreshMultisigProposalDetail,
  refreshMultisigProposals,
} from '@/store/slices/adminMultisigSlice'
import {
  clearAdminPayoutWithdrawalsActionError,
  refreshAdminPayoutWithdrawals,
} from '@/store/slices/adminPayoutWithdrawalsSlice'
import { refreshAdminTransactions } from '@/store/slices/adminTransactionsSlice'
import { refreshAdminReceivables } from '@/store/slices/adminReceivablesSlice'
import {
  payoutWithdrawalsListCacheKey,
} from '@/utils/payoutWithdrawalsListCache'
import {
  ADMIN_INVESTORS_FULL_LIST_FILTER,
  adminInvestorsListCacheKey,
} from '@/utils/adminInvestorsListCache'
import {
  ADMIN_RECEIVABLES_FULL_LIST_FILTER,
  adminReceivablesListCacheKey,
} from '@/utils/adminReceivablesListCache'
import {
  adminTransactionsListCacheKey,
} from '@/utils/adminTransactionsListCache'
import {
  ADMIN_MERCHANTS_FULL_LIST_FILTER,
  adminMerchantsListCacheKey,
} from '@/utils/adminMerchantsListCache'
import {
  ADMIN_LOAN_MONITORING_FULL_LIST_FILTER,
  adminLoanMonitoringListCacheKey,
} from '@/utils/adminLoanMonitoringListCache'

type AdminFetchErrorContext = {
  open: boolean
  title: string
  message: string
  onRetry: () => void
}

const isInvestorProfilePath = (path: string) =>
  /^\/dashboard\/admin\/investors\/[^/]+$/.test(path) &&
  !path.includes('/activity/')

const isMerchantProfilePath = (path: string) => /^\/dashboard\/admin\/merchants\/[^/]+$/.test(path)

const isLoanMonitoringDetailPath = (path: string) =>
  /^\/dashboard\/admin\/loan-monitoring\/[^/]+$/.test(path)

export default function AdminFetchErrorModal() {
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  const { merchantId, investorId, loanId } = useParams<{
    merchantId?: string
    investorId?: string
    loanId?: string
  }>()

  const dashboard = useAppSelector((s) => s.adminDashboard)
  const merchants = useAppSelector((s) => s.adminMerchants)
  const investors = useAppSelector((s) => s.adminInvestors)
  const payoutWithdrawals = useAppSelector((s) => s.adminPayoutWithdrawals)
  const loanMonitoring = useAppSelector((s) => s.adminLoanMonitoring)
  const transactions = useAppSelector((s) => s.adminTransactions)
  const receivables = useAppSelector((s) => s.adminReceivables)
  const multisig = useAppSelector((s) => s.adminMultisig)
  const { proposalId } = useParams<{ proposalId?: string }>()

  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  const context = useMemo((): AdminFetchErrorContext | null => {
    if (pathname === '/dashboard/admin/overview' || pathname === '/dashboard/admin') {
      if (dashboard.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load dashboard',
        message:
          dashboard.error?.trim() ||
          'Platform overview sync failed. Please check your connection and try again.',
        onRetry: () => {
          void dispatch(refreshAdminDashboard())
        },
      }
    }

    if (pathname === '/dashboard/admin/merchants') {
      if (merchants.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load merchants',
        message: merchants.error?.trim() || 'Could not load merchants.',
        onRetry: () => {
          const cacheKey = adminMerchantsListCacheKey(ADMIN_MERCHANTS_FULL_LIST_FILTER)
          const hasCache = Object.prototype.hasOwnProperty.call(merchants.resultsCache, cacheKey)
          void dispatch(
            refreshAdminMerchants({
              ...ADMIN_MERCHANTS_FULL_LIST_FILTER,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (isMerchantProfilePath(pathname) && merchantId) {
      if (merchants.profileStatus !== 'failed' || merchants.profileMerchantId !== merchantId) {
        return null
      }
      return {
        open: true,
        title: 'Unable to load merchant profile',
        message: merchants.profileError?.trim() || 'Could not load merchant profile.',
        onRetry: () => {
          const params = merchants.lastProfileRequest
          void dispatch(
            refreshAdminMerchantProfile(
              params?.merchantUserId === merchantId
                ? params
                : { merchantUserId: merchantId },
            ),
          )
        },
      }
    }

    if (pathname === '/dashboard/admin/investors') {
      if (investors.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load investors',
        message: investors.error?.trim() || 'Could not load investors.',
        onRetry: () => {
          const cacheKey = adminInvestorsListCacheKey(ADMIN_INVESTORS_FULL_LIST_FILTER)
          const hasCache = Object.prototype.hasOwnProperty.call(investors.resultsCache, cacheKey)
          void dispatch(
            refreshAdminInvestors({
              ...ADMIN_INVESTORS_FULL_LIST_FILTER,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (isInvestorProfilePath(pathname) && investorId) {
      if (investors.profileStatus !== 'failed' || investors.profileInvestorId !== investorId) {
        return null
      }
      return {
        open: true,
        title: 'Unable to load investor profile',
        message: investors.profileError?.trim() || 'Could not load investor profile.',
        onRetry: () => {
          const params = investors.lastProfileRequest
          void dispatch(
            refreshAdminInvestorProfile(
              params?.investorUserId === investorId
                ? params
                : { investorUserId: investorId },
            ),
          )
        },
      }
    }

    if (pathname === '/dashboard/admin/governance') {
      if (multisig.listStatus !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load governance queue',
        message: multisig.listError?.trim() || 'Could not load governance proposals.',
        onRetry: () => {
          const cacheKey = governanceListCacheKey(GOVERNANCE_FULL_LIST_FILTER)
          const hasCache = Object.prototype.hasOwnProperty.call(multisig.proposalsCache, cacheKey)
          void dispatch(
            refreshMultisigProposals({
              ...GOVERNANCE_FULL_LIST_FILTER,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (pathname.startsWith('/dashboard/admin/governance/') && proposalId) {
      if (multisig.actionStatus === 'failed' && multisig.actionProposalId === proposalId) {
        return {
          open: true,
          title: 'Governance action failed',
          message: multisig.actionError?.trim() || 'Could not complete governance action.',
          onRetry: () => {
            void dispatch(refreshMultisigProposalDetail(proposalId))
          },
        }
      }
      if (multisig.detailStatus !== 'failed' || multisig.detailProposalId !== proposalId) return null
      return {
        open: true,
        title: 'Unable to load proposal',
        message: multisig.detailError?.trim() || 'Could not load governance proposal.',
        onRetry: () => {
          void dispatch(refreshMultisigProposalDetail(proposalId))
        },
      }
    }

    if (pathname === '/dashboard/admin/payout-withdrawals') {
      if (payoutWithdrawals.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load payout & withdrawal requests',
        message: payoutWithdrawals.error?.trim() || 'Could not load payout and withdrawal requests.',
        onRetry: () => {
          const retryQuery = {
            status: payoutWithdrawals.lastStatusFilter,
            type: payoutWithdrawals.lastTypeFilter,
            search: payoutWithdrawals.lastSearch || undefined,
            limit: payoutWithdrawals.lastLimit || DASHBOARD_LIST_PAGE_SIZE,
            offset: payoutWithdrawals.lastOffset ?? 0,
          }
          const cacheKey = payoutWithdrawalsListCacheKey(retryQuery)
          const hasCache = Object.prototype.hasOwnProperty.call(payoutWithdrawals.resultsCache, cacheKey)
          void dispatch(
            refreshAdminPayoutWithdrawals({
              ...retryQuery,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (pathname === '/dashboard/admin/transactions') {
      if (transactions.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load transactions',
        message: transactions.error?.trim() || 'Could not load transactions.',
        onRetry: () => {
          const retryQuery = {
            status: transactions.lastStatusFilter,
            type: transactions.lastTypeFilter,
            search: transactions.lastSearch || undefined,
            limit: transactions.lastLimit || DASHBOARD_LIST_PAGE_SIZE,
            offset: transactions.lastOffset ?? 0,
          }
          const cacheKey = adminTransactionsListCacheKey(retryQuery)
          const hasCache = Object.prototype.hasOwnProperty.call(transactions.resultsCache, cacheKey)
          void dispatch(
            refreshAdminTransactions({
              ...retryQuery,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (pathname === '/dashboard/admin/receivables') {
      if (receivables.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load receivables',
        message: receivables.error?.trim() || 'Could not load receivables.',
        onRetry: () => {
          const cacheKey = adminReceivablesListCacheKey(ADMIN_RECEIVABLES_FULL_LIST_FILTER)
          const hasCache = Object.prototype.hasOwnProperty.call(receivables.resultsCache, cacheKey)
          void dispatch(
            refreshAdminReceivables({
              ...ADMIN_RECEIVABLES_FULL_LIST_FILTER,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (pathname === '/dashboard/admin/loan-monitoring') {
      if (loanMonitoring.status !== 'failed') return null
      return {
        open: true,
        title: 'Unable to load loans',
        message: loanMonitoring.error?.trim() || 'Could not load loan monitoring data.',
        onRetry: () => {
          const cacheKey = adminLoanMonitoringListCacheKey(ADMIN_LOAN_MONITORING_FULL_LIST_FILTER)
          const hasCache = Object.prototype.hasOwnProperty.call(loanMonitoring.resultsCache, cacheKey)
          void dispatch(
            refreshAdminLoanMonitoring({
              ...ADMIN_LOAN_MONITORING_FULL_LIST_FILTER,
              background: hasCache,
            }),
          )
        },
      }
    }

    if (isLoanMonitoringDetailPath(pathname) && loanId) {
      if (loanMonitoring.detailStatus !== 'failed' || loanMonitoring.detailLoanId !== loanId) {
        return null
      }
      return {
        open: true,
        title: 'Unable to load loan details',
        message: loanMonitoring.detailError?.trim() || 'Could not load loan details.',
        onRetry: () => {
          void dispatch(refreshAdminLoanMonitoringDetail({ loanId }))
        },
      }
    }

    return null
  }, [
    pathname,
    merchantId,
    investorId,
    loanId,
    dashboard,
    merchants,
    investors,
    payoutWithdrawals,
    loanMonitoring,
    transactions,
    receivables,
    multisig,
    proposalId,
    dispatch,
  ])

  const errorKey = useMemo(() => {
    if (!context?.open) return null
    return `${pathname}:${context.message}`
  }, [context, pathname])

  useEffect(() => {
    setDismissedKey(null)
  }, [pathname])

  useEffect(() => {
    if (context?.open) {
      setDismissedKey(null)
    }
  }, [errorKey, context?.open])

  if (!context?.open) return null

  const modalOpen = dismissedKey !== errorKey

  return (
    <DashboardErrorModal
      open={modalOpen}
      title={context.title}
      message={context.message}
      retryLabel="Try again"
      onRetry={context.onRetry}
      onClose={() => {
        setDismissedKey(errorKey)
        if (isLoanMonitoringDetailPath(pathname) && loanMonitoring.actionStatus === 'failed') {
          dispatch(clearAdminLoanMonitoringActionError())
        }
        if (pathname === '/dashboard/admin/payout-withdrawals' && payoutWithdrawals.actionStatus === 'failed') {
          dispatch(clearAdminPayoutWithdrawalsActionError())
        }
        if (pathname.startsWith('/dashboard/admin/governance/') && multisig.actionStatus === 'failed') {
          dispatch(clearAdminMultisigActionError())
        }
      }}
    />
  )
}
