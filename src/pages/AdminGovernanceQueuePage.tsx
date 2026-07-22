import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { adminGovernanceProposalPath } from '@/api/adminActionResponse'
import {
  filterGovernanceProposalsByStatus,
  GOVERNANCE_FULL_LIST_FILTER,
  governanceListCacheKey,
} from '@/admin/governance/governanceListCache'
import { canUserSignGovernanceProposal } from '@/admin/governance/governanceSigner'
import { useGovernanceSignAndSubmit } from '@/admin/governance/useGovernanceSignAndSubmit'
import {
  governanceOperationLabel,
  governanceStatusPillVariant,
} from '@/components/admin/governance/adminGovernanceUi'
import { usePaginatedListItems } from '@/hooks/usePaginatedListItems'
import {
  AdminListPagination,
  AdminPageFrame,
  AdminPanel,
  AdminSearchField,
  AdminSegmentedTabs,
  AdminStatusPill,
  AdminTableHeadRow,
  AdminTableShell,
  AdminToolbarRow,
  adminZebraRowClass,
  type AdminTabItem,
} from '@/components/admin/primitives'
import { proposalStatusLabel } from '@/api/multisig/normalize'
import { getDefaultBlockExplorerBase, blockExplorerTxUrl } from '@/api/payout'
import { shortAddress } from '@/components/admin/settings/SettingsPanel'
import type { ProposalStatus } from '@/api/types/multisig'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  hasActiveGovernanceProposals,
  refreshMultisigConfig,
  refreshMultisigProposals,
} from '@/store/slices/adminMultisigSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'

const STATUS_TABS = ['All', 'Pending signatures', 'Ready', 'Executed', 'Failed', 'Cancelled'] as const
type StatusTab = (typeof STATUS_TABS)[number]

const STATUS_TAB_ITEMS: AdminTabItem<StatusTab>[] = STATUS_TABS.map((t) => ({ value: t, label: t }))

const TABLE_HEADERS = ['Type', 'Summary', 'Status', 'Related', 'Created', 'Execution tx', 'Action'] as const

const POLL_MS = 90_000
const FULL_LIST_CACHE_KEY = governanceListCacheKey(GOVERNANCE_FULL_LIST_FILTER)

function tabToStatusFilter(tab: StatusTab): ProposalStatus | 'all' {
  switch (tab) {
    case 'Pending signatures':
      return 'pending_signatures'
    case 'Ready':
      return 'ready'
    case 'Executed':
      return 'executed'
    case 'Failed':
      return 'failed'
    case 'Cancelled':
      return 'cancelled'
    default:
      return 'all'
  }
}

const AdminGovernanceQueuePage = () => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const sessionKind = useAppSelector((s) => s.auth.sessionKind)
  const { proposals, proposalsCache, listStatus, config } = useAppSelector((s) => s.adminMultisig)
  const { address, isConnected } = useActiveWallet()
  const { signAndSubmit, pending: signPending } = useGovernanceSignAndSubmit()
  const [signingProposalId, setSigningProposalId] = useState<string | null>(null)

  const [statusTab, setStatusTab] = useState<StatusTab>('All')
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(searchInput.trim().toLowerCase()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const apiStatus = useMemo(() => tabToStatusFilter(statusTab), [statusTab])

  const hasFullListCache = Object.prototype.hasOwnProperty.call(proposalsCache, FULL_LIST_CACHE_KEY)

  const allProposals = useMemo(() => {
    if (hasFullListCache) return proposalsCache[FULL_LIST_CACHE_KEY]
    return proposals
  }, [hasFullListCache, proposalsCache, proposals])

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    if (config) return
    void dispatch(refreshMultisigConfig())
  }, [dispatch, accessToken, sessionKind, config])

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    void dispatch(
      refreshMultisigProposals({
        ...GOVERNANCE_FULL_LIST_FILTER,
        background: hasFullListCache,
      }),
    )
    // Load the full list once per visit; status tabs filter client-side only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasFullListCache read at dispatch time only
  }, [dispatch, accessToken, sessionKind])

  useEffect(() => {
    if (!accessToken?.trim() || sessionKind !== 'admin') return
    if (!hasActiveGovernanceProposals(allProposals)) return
    const id = window.setInterval(() => {
      void dispatch(
        refreshMultisigProposals({
          ...GOVERNANCE_FULL_LIST_FILTER,
          background: true,
        }),
      )
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [dispatch, accessToken, sessionKind, allProposals])

  const statusFiltered = useMemo(
    () => filterGovernanceProposalsByStatus(allProposals, apiStatus),
    [allProposals, apiStatus],
  )

  const filtered = useMemo(() => {
    if (!searchDebounced) return statusFiltered
    return statusFiltered.filter((p) => {
      const hay = [p.summary, p.relatedId ?? '', p.id, p.operationType].join(' ').toLowerCase()
      return hay.includes(searchDebounced)
    })
  }, [statusFiltered, searchDebounced])

  const { pageItems, meta, setPage } = usePaginatedListItems(filtered, [statusTab, searchDebounced])

  const handleQuickSign = useCallback(
    async (proposalId: string) => {
      setSigningProposalId(proposalId)
      try {
        await signAndSubmit(proposalId)
        await dispatch(
          refreshMultisigProposals({
            ...GOVERNANCE_FULL_LIST_FILTER,
            background: true,
          }),
        ).unwrap()
      } finally {
        setSigningProposalId(null)
      }
    },
    [signAndSubmit, dispatch],
  )

  const canQuickSign = useCallback(
    (row: (typeof allProposals)[number]) => {
      if (signPending) return false
      return canUserSignGovernanceProposal({
        status: row.status,
        missingSigners: row.missingSigners,
        walletAddress: address,
        multisigSigners: config?.signers ?? [],
        isConnected,
      })
    },
    [isConnected, address, signPending, config?.signers],
  )

  const explorerBase = getDefaultBlockExplorerBase()
  const tableLoading = listStatus === 'loading' && allProposals.length === 0

  return (
    <AdminPageFrame>
      {config ? (
        <div className="rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 text-[#6B7488] text-[13px]">
          Multisig {config.multisigAddress ? shortAddress(config.multisigAddress) : '—'} ·{' '}
          {config.threshold}-of-{config.signerCount || config.signers.length} ·{' '}
          {config.signers.length} signer{config.signers.length === 1 ? '' : 's'} · chain {config.chainId || '—'}
        </div>
      ) : null}

      <AdminPanel>
        <AdminToolbarRow
          start={<AdminSegmentedTabs items={STATUS_TAB_ITEMS} value={statusTab} onChange={setStatusTab} />}
          end={
            <AdminSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search proposals"
              aria-label="Search governance proposals"
            />
          }
        />

        <AdminTableShell minWidthClassName="min-w-[1080px]">
          <AdminTableHeadRow labels={TABLE_HEADERS} />
          <tbody className="bg-white">
            {tableLoading ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  Loading governance proposals…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-10 text-center text-[#6B7488] text-[14px]">
                  No proposals match this filter.
                </td>
              </tr>
            ) : (
              pageItems.map((row, idx) => {
                const txUrl =
                  explorerBase && row.executionTxHash
                    ? blockExplorerTxUrl(explorerBase, row.executionTxHash)
                    : null
                const showSign = canQuickSign(row)
                const rowSigning = signPending && signingProposalId === row.id
                return (
                  <tr key={row.id} className={adminZebraRowClass(idx)}>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] font-medium">
                      {governanceOperationLabel(row.operationType)}
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px] max-w-[280px]">{row.summary}</td>
                    <td className="px-5 py-5">
                      <AdminStatusPill variant={governanceStatusPillVariant(row.status)}>
                        {proposalStatusLabel(row.status)}
                      </AdminStatusPill>
                    </td>
                    <td className="px-5 py-5 text-[#6B7488] text-[13px] font-mono max-w-[180px] truncate">
                      {row.relatedId ?? '—'}
                    </td>
                    <td className="px-5 py-5 text-[#0B1220] text-[14px]">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-5 text-[14px]">
                      {txUrl ? (
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#195EBC] hover:underline font-mono text-[13px]"
                        >
                          View tx
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        {showSign ? (
                          <button
                            type="button"
                            disabled={rowSigning}
                            onClick={() => void handleQuickSign(row.id)}
                            className="text-[#195EBC] text-[14px] font-semibold hover:underline disabled:opacity-50"
                          >
                            {rowSigning ? 'Signing…' : 'Sign'}
                          </button>
                        ) : null}
                        <Link
                          to={adminGovernanceProposalPath(row.id)}
                          className="text-[#195EBC] text-[14px] font-semibold hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </AdminTableShell>
        <AdminListPagination meta={meta} onPageChange={setPage} loading={tableLoading} />
      </AdminPanel>
    </AdminPageFrame>
  )
}

export default AdminGovernanceQueuePage
