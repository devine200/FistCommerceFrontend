import { useMemo } from 'react'

import { AdminMerchantProfileReceivablesPanels } from './AdminMerchantProfileReceivablesPanels'
import { AdminMerchantProfileSummary } from './AdminMerchantProfileSummary'
import { filterMerchantProfileReceivableRows } from './merchantProfileReceivableFilters'
import { buildMerchantProfileStatColumns } from './merchantProfileStatColumns'
import type { AdminMerchantProfileViewProps } from './types'

export function AdminMerchantProfileView({
  avatarSrc,
  avatarAlt,
  profile,
  activeSearchValue,
  onActiveSearchChange,
  allSearchValue,
  onAllSearchChange,
  receivablesLoading = false,
}: AdminMerchantProfileViewProps) {
  const { statColumns } = useMemo(() => buildMerchantProfileStatColumns(profile), [profile])

  const filteredActiveReceivables = useMemo(
    () => filterMerchantProfileReceivableRows(profile.activeReceivables, activeSearchValue),
    [profile.activeReceivables, activeSearchValue],
  )

  const filteredAllReceivables = useMemo(
    () => filterMerchantProfileReceivableRows(profile.allReceivables, allSearchValue),
    [profile.allReceivables, allSearchValue],
  )

  const allSearchActive = allSearchValue.trim().length > 0

  return (
    <>
      <AdminMerchantProfileSummary
        avatarSrc={avatarSrc}
        avatarAlt={avatarAlt}
        displayName={profile.displayName}
        walletLabel={profile.walletLabel}
        statColumns={statColumns}
      />
      <AdminMerchantProfileReceivablesPanels
        activeReceivables={filteredActiveReceivables}
        allReceivables={filteredAllReceivables}
        allReceivablesPanelCount={
          allSearchActive ? filteredAllReceivables.length : profile.allReceivablesPanelCount
        }
        activeSearchValue={activeSearchValue}
        onActiveSearchChange={onActiveSearchChange}
        allSearchValue={allSearchValue}
        onAllSearchChange={onAllSearchChange}
        receivablesLoading={receivablesLoading}
      />
    </>
  )
}
