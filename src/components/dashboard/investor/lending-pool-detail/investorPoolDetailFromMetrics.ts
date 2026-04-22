import {
  blockExplorerAddressUrl,
  getDefaultSepoliaBlockExplorerBase,
  type RecentPayoutBundle,
} from '@/api/payout'
import {
  displayDashboardMetricString,
  displayDashboardPercentString,
  displayInvestorRoiPercent,
  displayPoolApyPercent,
  displayPoolMinDeposit,
  displayPoolUtilization,
  type InvestorMetrics,
  type PoolMetrics,
} from '@/api/metrics'
import type { ContractField } from '@/components/dashboard/investor/lending-pool-detail/types'
import { getInvestorPoolDetailConfig } from '@/components/dashboard/investor/lending-pool-detail/investorPoolDetailConfig'
import type {
  InvestorPoolDetailConfig,
  InvestorPoolTopBarConfig,
  PoolStatItem,
} from '@/components/dashboard/investor/lending-pool-detail/types'
import type { LendingPoolCardState } from '@/store/slices/investorDashboardSlice'

function walletTopBar(walletAddress: string | null | undefined, fallback: string): InvestorPoolTopBarConfig {
  const a = walletAddress?.trim()
  if (a && a.length > 12) {
    return { walletDisplay: `${a.slice(0, 6)}…${a.slice(-4)}` }
  }
  if (a) {
    return { walletDisplay: a }
  }
  return { walletDisplay: fallback.trim() || '—' }
}

function poolCardLikeFields(pool: PoolMetrics): {
  tvl: string
  apy: string
  minDeposit: string
  utilization: string
} {
  const apy = displayPoolApyPercent(pool.apy)
  const tvl = displayDashboardMetricString(pool.tvl)
  const minDeposit = displayPoolMinDeposit(pool.minDeposit)
  const utilization = displayPoolUtilization(pool.utilization)

  return {
    apy: apy !== '—' ? (apy.includes('APY') ? apy : `${apy} APY`) : apy,
    tvl: tvl !== '—' ? (tvl.includes('USDC') || tvl.includes('USDT') ? tvl : `${tvl} USDC`) : tvl,
    minDeposit:
      minDeposit !== '—'
        ? minDeposit.includes('USDC') || minDeposit.includes('USDT')
          ? minDeposit
          : `${minDeposit} USDC`
        : minDeposit,
    utilization:
      utilization !== '—'
        ? utilization.toLowerCase().includes('allocated')
          ? utilization
          : `${utilization} Allocated`
        : utilization,
  }
}

export function poolMetricsToHeaderStats(pool: PoolMetrics): PoolStatItem[] {
  const card = poolCardLikeFields(pool)
  return [
    // Keep these aligned with the investor dashboard pool card formatting.
    { label: 'TVL', value: card.tvl },
    { label: 'Liquid assets', value: displayDashboardMetricString(pool.liquidAssets) },
    { label: 'Outstanding', value: displayDashboardMetricString(pool.outstanding) },
    { label: 'Available liquidity', value: displayDashboardMetricString(pool.availableLiquidity) },
    { label: 'Utilization', value: card.utilization },
    { label: 'APY', value: card.apy },
    { label: 'Min deposit', value: card.minDeposit },
  ]
}

export function investorMetricsToMyStats(inv: InvestorMetrics): PoolStatItem[] {
  return [
    { label: 'Total deposited', value: displayDashboardMetricString(inv.total_deposited) },
    { label: 'Total withdrawn', value: displayDashboardMetricString(inv.total_withdrawn) },
    { label: 'Current position value', value: displayDashboardMetricString(inv.current_position_value) },
    { label: 'Total interest earned', value: displayDashboardMetricString(inv.total_interest_earned) },
    { label: 'Share of pool', value: displayDashboardPercentString(inv.share_of_pool) },
    { label: 'Net deposited', value: displayDashboardMetricString(inv.netDeposited) },
    { label: 'ROI', value: displayInvestorRoiPercent(inv.roi) },
  ]
}

/**
 * Keeps static strategy, contracts, transactions, and pool performance copy from `staticBase`,
 * while replacing hero / my-stats and title area from live metrics + dashboard card.
 */
export function mergeInvestorPoolDetailWithMetrics(
  staticBase: InvestorPoolDetailConfig,
  params: {
    lendingPool: LendingPoolCardState
    poolMetrics: PoolMetrics
    investorMetrics: InvestorMetrics
    walletAddress: string | null | undefined
    walletDisplayFallback: string
  },
): InvestorPoolDetailConfig {
  const { lendingPool, poolMetrics, investorMetrics, walletAddress, walletDisplayFallback } = params
  const wallet = walletTopBar(walletAddress, walletDisplayFallback)
  return {
    ...staticBase,
    title: lendingPool.poolTitle?.trim() || staticBase.title,
    subtitle: lendingPool.tagline?.trim() || staticBase.subtitle,
    topBar: {
      walletDisplay: wallet.walletDisplay,
      showUnreadNotification: staticBase.topBar?.showUnreadNotification,
    },
    headerStats: poolMetricsToHeaderStats(poolMetrics),
    myStats: investorMetricsToMyStats(investorMetrics),
  }
}

function shortEthAddress(addr: string): string {
  const a = addr.trim()
  if (a.length <= 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function patchSmartContractAddressRow(rows: ContractField[], fullAddress: string | null): ContractField[] {
  if (!fullAddress || !/^0x[a-fA-F0-9]{40}$/i.test(fullAddress)) return rows
  return rows.map((row) =>
    row.label === 'Smart Contract Address'
      ? { ...row, value: shortEthAddress(fullAddress), copyValue: fullAddress }
      : row,
  )
}

/**
 * Applies `GET /api/payout/recent-transactions/` data: list rows, contract address row, and Sepolia explorer link.
 * Explorer base: API `block_explorer_base_url` (or similar) first, else `VITE_ETH_SEPOLIA_BLOCK_EXPLORER_URL`.
 */
export function mergeInvestorPoolPayoutIntoConfig(
  config: InvestorPoolDetailConfig,
  payout: RecentPayoutBundle | null,
): InvestorPoolDetailConfig {
  if (!payout) {
    return config.contractExplorerHref == null ? config : { ...config, contractExplorerHref: null }
  }

  const explorerBase =
    payout.explorerBaseUrl?.trim().replace(/\/+$/, '') || getDefaultSepoliaBlockExplorerBase()
  const contract = payout.contractAddress?.trim() ?? null
  const contractOk = Boolean(contract && /^0x[a-fA-F0-9]{40}$/i.test(contract))
  const contractExplorerHref =
    explorerBase && contractOk && contract ? blockExplorerAddressUrl(explorerBase, contract) : null

  const useLiveTx = payout.transactions.length > 0
  const transactions = useLiveTx ? payout.transactions : config.transactions
  const contractRows = contractOk && contract ? patchSmartContractAddressRow(config.contractRows, contract) : config.contractRows

  const nextHref = contractExplorerHref ?? null
  if (
    transactions === config.transactions &&
    contractRows === config.contractRows &&
    nextHref === (config.contractExplorerHref ?? null)
  ) {
    return config
  }

  return {
    ...config,
    contractRows,
    transactions,
    contractExplorerHref: nextHref,
  }
}

export function resolveInvestorPoolLayoutMeta(
  poolSlug: string | undefined,
  lendingPool: LendingPoolCardState,
  walletAddress: string | null | undefined,
  walletDisplayFallback: string,
): { ok: true; title: string; topBar?: InvestorPoolTopBarConfig } | { ok: false } {
  const staticCfg = getInvestorPoolDetailConfig(poolSlug, { dashboardPoolId: lendingPool.id })
  if (!staticCfg || !poolSlug) return { ok: false }
  const wallet = walletTopBar(walletAddress, walletDisplayFallback)
  const title = poolSlug === lendingPool.id ? lendingPool.poolTitle : staticCfg.title
  return {
    ok: true,
    title,
    topBar: {
      walletDisplay: wallet.walletDisplay,
      showUnreadNotification: staticCfg.topBar?.showUnreadNotification,
    },
  }
}
