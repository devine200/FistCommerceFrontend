import { useMemo, useState } from 'react'

import { AdminMerchantProfileReceivablesPanels } from './AdminMerchantProfileReceivablesPanels'
import { AdminMerchantProfileSummary } from './AdminMerchantProfileSummary'
import { buildMerchantProfileStatColumns } from './merchantProfileStatColumns'
import { filterMerchantProfileReceivableRows } from './merchantProfileReceivableFilters'
import type { AdminMerchantProfileViewProps } from './types'

export function AdminMerchantProfileView({ avatarSrc, avatarAlt, profile }: AdminMerchantProfileViewProps) {
  const [activeSearch, setActiveSearch] = useState('')
  const [allSearch, setAllSearch] = useState('')

  const { statColumns } = useMemo(() => buildMerchantProfileStatColumns(profile), [profile])

  const filteredActive = useMemo(
    () => filterMerchantProfileReceivableRows(profile.activeReceivables, activeSearch),
    [profile.activeReceivables, activeSearch],
  )

  const filteredAll = useMemo(
    () => filterMerchantProfileReceivableRows(profile.allReceivables, allSearch),
    [profile.allReceivables, allSearch],
  )

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
        activeReceivables={filteredActive}
        allReceivables={filteredAll}
        allReceivablesPanelCount={profile.allReceivablesPanelCount}
        activeSearchValue={activeSearch}
        onActiveSearchChange={setActiveSearch}
        allSearchValue={allSearch}
        onAllSearchChange={setAllSearch}
      />
    </>
  )
}
