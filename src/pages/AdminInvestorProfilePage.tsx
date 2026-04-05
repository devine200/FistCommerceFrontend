import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { AdminPageFrame } from '@/components/admin/primitives'
import {
  ACTIVITY_FILTER_TABS,
  AdminInvestorActivityPanel,
  AdminInvestorInvestmentListPanel,
  AdminInvestorProfileSummary,
  buildInvestorProfileStatColumns,
  filterActivityLineItems,
  filterInvestmentLineItems,
  type ActivityFilterValue,
} from '@/components/admin/investors/profile'
import profileAvatarImage from '@/assets/Ellipse 5.png'
import { useAppSelector } from '@/store/hooks'
import { selectInvestorProfile } from '@/store/slices/adminInvestorsSlice'

const INVESTORS_LIST_PATH = '/dashboard/admin/investors'

const AdminInvestorProfilePage = () => {
  const { investorId } = useParams<{ investorId: string }>()
  const profile = useAppSelector((s) =>
    investorId ? selectInvestorProfile(s.adminInvestors, investorId) : null,
  )

  const [activeSearch, setActiveSearch] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [activitySearch, setActivitySearch] = useState('')
  const [activityFilter, setActivityFilter] = useState<ActivityFilterValue>('all')

  const filteredActive = useMemo(
    () => (profile ? filterInvestmentLineItems(profile.activeInvestments, activeSearch) : []),
    [profile, activeSearch],
  )

  const filteredHistory = useMemo(
    () => (profile ? filterInvestmentLineItems(profile.investmentHistory, historySearch) : []),
    [profile, historySearch],
  )

  const filteredActivity = useMemo(
    () => (profile ? filterActivityLineItems(profile.activity, activityFilter, activitySearch) : []),
    [profile, activitySearch, activityFilter],
  )

  if (!profile || !investorId) {
    return <Navigate to={INVESTORS_LIST_PATH} replace />
  }

  const { statColumns } = buildInvestorProfileStatColumns(profile)

  return (
    <AdminPageFrame>
      <AdminInvestorProfileSummary
        avatarSrc={profileAvatarImage}
        displayName={profile.displayName}
        walletLabel={profile.walletLabel}
        statColumns={statColumns}
      />

      <AdminInvestorInvestmentListPanel
        investorId={investorId}
        title="Active Investments"
        items={filteredActive}
        searchValue={activeSearch}
        onSearchChange={setActiveSearch}
        searchAriaLabel="Search active investments"
      />

      <AdminInvestorInvestmentListPanel
        investorId={investorId}
        title="Investment History"
        items={filteredHistory}
        searchValue={historySearch}
        onSearchChange={setHistorySearch}
        searchAriaLabel="Search investment history"
      />

      <AdminInvestorActivityPanel
        investorId={investorId}
        items={filteredActivity}
        searchValue={activitySearch}
        onSearchChange={setActivitySearch}
        activityFilter={activityFilter}
        onActivityFilterChange={setActivityFilter}
        filterTabs={[...ACTIVITY_FILTER_TABS]}
      />
    </AdminPageFrame>
  )
}

export default AdminInvestorProfilePage
