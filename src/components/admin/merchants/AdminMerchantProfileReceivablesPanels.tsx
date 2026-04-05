import { AdminMerchantReceivablesTablePanel } from './AdminMerchantReceivablesTablePanel'
import type { AdminMerchantProfileReceivablesPanelsProps } from './types'

const DEFAULT_ACTIVE_TITLE = 'Active Receivables'
const DEFAULT_ALL_TITLE = 'All Receivables'

export function AdminMerchantProfileReceivablesPanels({
  activeReceivables,
  allReceivables,
  allReceivablesPanelCount,
  activeSearchValue,
  onActiveSearchChange,
  allSearchValue,
  onAllSearchChange,
  activePanelTitle = DEFAULT_ACTIVE_TITLE,
  allPanelTitle = DEFAULT_ALL_TITLE,
  activePanelSearchAriaLabel = 'Search active receivables',
  allPanelSearchAriaLabel = 'Search all receivables',
}: AdminMerchantProfileReceivablesPanelsProps) {
  return (
    <>
      <AdminMerchantReceivablesTablePanel
        title={activePanelTitle}
        items={activeReceivables}
        searchValue={activeSearchValue}
        onSearchChange={onActiveSearchChange}
        searchAriaLabel={activePanelSearchAriaLabel}
      />
      <AdminMerchantReceivablesTablePanel
        title={allPanelTitle}
        items={allReceivables}
        titleCountOverride={allReceivablesPanelCount}
        searchValue={allSearchValue}
        onSearchChange={onAllSearchChange}
        searchAriaLabel={allPanelSearchAriaLabel}
      />
    </>
  )
}
