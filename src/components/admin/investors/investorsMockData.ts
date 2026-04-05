export type KycStatus = 'Approved' | 'Rejected' | 'Under Review'

export type InvestorTableRow = {
  id: string
  receivableId: string
  investorName: string
  investorWallet: string
  invested: string
  earnings: string
  amountWithdrawn: string
  kycStatus: KycStatus
  receivablesCountLabel: string
}

export type InvestmentLineItem = {
  id: string
  title: string
  dateLabel: string
  amount: string
}

export type ActivityKind = 'invest' | 'earn' | 'withdraw'

export type ActivityLineItem = {
  id: string
  kind: ActivityKind
  title: string
  dateLabel: string
  amountDisplay: string
}

/** Breakdown shown on admin “Investment Details” (from an invest activity). */
export type InvestmentActivityDetail = {
  activityId: string
  investorId: string
  investorName: string
  maturityHeadline: string
  progressPercent: number
  progressRangeLabel: string
  amountInvested: string
  expectedReturns: string
  totalPayout: string
  investmentDateLabel: string
  maturityDateLabel: string
  statusLabel: string
}

export type InvestmentDetailFields = Omit<
  InvestmentActivityDetail,
  'activityId' | 'investorId' | 'investorName'
>

const ACTIVITY_INVESTMENT_DETAIL: Record<string, InvestmentDetailFields> = {
  ac1: {
    maturityHeadline: '20 Days Until Maturity',
    progressPercent: 80,
    progressRangeLabel: '24th March 2026 – 20th April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '4.5%',
    totalPayout: '$22,450.00',
    investmentDateLabel: '24th March 2026',
    maturityDateLabel: '20th April 2026',
    statusLabel: 'Active',
  },
  ac3: {
    maturityHeadline: '45 Days Until Maturity',
    progressPercent: 35,
    progressRangeLabel: '20th February 2026 – 15th May 2026',
    amountInvested: '$15,000.00',
    expectedReturns: '5.0%',
    totalPayout: '$17,100.00',
    investmentDateLabel: '20th February 2026',
    maturityDateLabel: '15th May 2026',
    statusLabel: 'Active',
  },
  ac2: {
    maturityHeadline: 'Return credited to balance',
    progressPercent: 92,
    progressRangeLabel: '1st March 2026 – 20th April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '$340.00',
    totalPayout: '$20,340.00',
    investmentDateLabel: '8th March 2026',
    maturityDateLabel: '20th April 2026',
    statusLabel: 'Active',
  },
  ac4: {
    maturityHeadline: 'Withdrawal processed',
    progressPercent: 68,
    progressRangeLabel: '10th January 2026 – 20th April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '4.5%',
    totalPayout: '$17,500.00',
    investmentDateLabel: '8th March 2026',
    maturityDateLabel: '20th April 2026',
    statusLabel: 'Active',
  },
}

export type InvestorProfileDetail = {
  id: string
  displayName: string
  walletLabel: string
  email: string
  accountStatus: 'Active' | 'Inactive'
  kycLabel: string
  dateJoined: string
  totalInvested: string
  activeInvestmentsTotal: string
  totalReturnsEarned: string
  availableBalance: string
  amountWithdrawn: string
  activeInvestments: InvestmentLineItem[]
  investmentHistory: InvestmentLineItem[]
  activity: ActivityLineItem[]
}

export const INVESTOR_TABLE_ROWS: InvestorTableRow[] = [
  {
    id: 'i-1',
    receivableId: 'r-1',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$323,000',
    amountWithdrawn: '-$23,000',
    kycStatus: 'Approved',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'i-2',
    receivableId: 'r-2',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$420,000',
    amountWithdrawn: '$0',
    kycStatus: 'Rejected',
    receivablesCountLabel: '0 Receivables',
  },
  {
    id: 'i-3',
    receivableId: 'r-3',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$103,500',
    amountWithdrawn: '$0',
    kycStatus: 'Under Review',
    receivablesCountLabel: '3 Receivables',
  },
  {
    id: 'i-4',
    receivableId: 'r-4',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$23,000',
    amountWithdrawn: '-$23,000',
    kycStatus: 'Approved',
    receivablesCountLabel: '1 Receivables',
  },
  {
    id: 'i-5',
    receivableId: 'r-5',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$400,000',
    amountWithdrawn: '$0',
    kycStatus: 'Approved',
    receivablesCountLabel: '4 Receivables',
  },
  {
    id: 'i-6',
    receivableId: 'r-6',
    investorName: 'Ajala Harris',
    investorWallet: '48r7yfghn4j3kio9eud...',
    invested: '$323,000',
    earnings: '$150,000',
    amountWithdrawn: '$0',
    kycStatus: 'Approved',
    receivablesCountLabel: '11 Receivables',
  },
]

const poolLine = (id: string, dateLabel: string, amount: string): InvestmentLineItem => ({
  id,
  title: 'Invested in Fist Commerce Pool',
  dateLabel,
  amount,
})

const demoActive: InvestmentLineItem[] = [
  poolLine('a1', 'Mar 8, 2026', '$20,000'),
  poolLine('a2', 'Mar 8, 2026', '$20,000'),
]

const demoHistory: InvestmentLineItem[] = [
  poolLine('h1', 'Mar 8, 2026', '$20,000'),
  poolLine('h2', 'Mar 8, 2026', '$20,000'),
  poolLine('h3', 'Feb 20, 2026', '$15,000'),
  poolLine('h4', 'Feb 14, 2026', '$10,000'),
]

const demoActivity: ActivityLineItem[] = [
  { id: 'ac1', kind: 'invest', title: 'Invested in Fist Commerce Pool', dateLabel: 'Mar 8, 2026', amountDisplay: '$20,000' },
  { id: 'ac2', kind: 'earn', title: 'Earned from Fist Commerce Pool', dateLabel: 'Mar 5, 2026', amountDisplay: '+$340' },
  { id: 'ac3', kind: 'invest', title: 'Invested in Fist Commerce Pool', dateLabel: 'Feb 20, 2026', amountDisplay: '$15,000' },
  { id: 'ac4', kind: 'withdraw', title: 'Withdrawal from Fist Commerce Pool', dateLabel: 'Feb 14, 2026', amountDisplay: '-$2,500' },
]

function profileFromRow(row: InvestorTableRow): InvestorProfileDetail {
  const kycLabel = row.kycStatus === 'Approved' ? 'Verified' : row.kycStatus
  return {
    id: row.id,
    displayName: row.investorName,
    walletLabel: row.investorWallet,
    email: 'user1234@gmail.com',
    accountStatus: 'Active',
    kycLabel,
    dateJoined: '24th March 2026',
    totalInvested: '$60,000',
    activeInvestmentsTotal: '$40,000',
    totalReturnsEarned: '$0.00',
    availableBalance: '$48,000',
    amountWithdrawn: '$20,000',
    activeInvestments: demoActive,
    investmentHistory: demoHistory,
    activity: demoActivity,
  }
}

/** Detail rows for Active / History pool line items (`a*`, `h*`). */
const LINE_ITEM_INVESTMENT_DETAIL: Record<string, InvestmentDetailFields> = {
  a1: {
    maturityHeadline: '20 Days Until Maturity',
    progressPercent: 80,
    progressRangeLabel: '24th March 2026 – 20th April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '4.5%',
    totalPayout: '$22,450.00',
    investmentDateLabel: '8th March 2026',
    maturityDateLabel: '20th April 2026',
    statusLabel: 'Active',
  },
  a2: {
    maturityHeadline: '18 Days Until Maturity',
    progressPercent: 76,
    progressRangeLabel: '26th March 2026 – 22nd April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '4.5%',
    totalPayout: '$22,300.00',
    investmentDateLabel: '8th March 2026',
    maturityDateLabel: '22nd April 2026',
    statusLabel: 'Active',
  },
  h1: {
    maturityHeadline: 'Fully repaid',
    progressPercent: 100,
    progressRangeLabel: '8th March 2026 – 8th April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '4.5%',
    totalPayout: '$22,450.00',
    investmentDateLabel: '8th March 2026',
    maturityDateLabel: '8th April 2026',
    statusLabel: 'Completed',
  },
  h2: {
    maturityHeadline: 'Fully repaid',
    progressPercent: 100,
    progressRangeLabel: '8th March 2026 – 10th April 2026',
    amountInvested: '$20,000.00',
    expectedReturns: '4.5%',
    totalPayout: '$22,400.00',
    investmentDateLabel: '8th March 2026',
    maturityDateLabel: '10th April 2026',
    statusLabel: 'Completed',
  },
  h3: {
    maturityHeadline: 'Fully repaid',
    progressPercent: 100,
    progressRangeLabel: '20th February 2026 – 20th March 2026',
    amountInvested: '$15,000.00',
    expectedReturns: '5.0%',
    totalPayout: '$17,100.00',
    investmentDateLabel: '20th February 2026',
    maturityDateLabel: '20th March 2026',
    statusLabel: 'Completed',
  },
  h4: {
    maturityHeadline: 'Fully repaid',
    progressPercent: 100,
    progressRangeLabel: '14th February 2026 – 14th March 2026',
    amountInvested: '$10,000.00',
    expectedReturns: '4.8%',
    totalPayout: '$11,200.00',
    investmentDateLabel: '14th February 2026',
    maturityDateLabel: '14th March 2026',
    statusLabel: 'Completed',
  },
}

function defaultInvestmentDetailFromActivity(
  activity: ActivityLineItem,
  profile: InvestorProfileDetail,
): InvestmentDetailFields {
  let maturityHeadline = 'Investment activity'
  if (activity.kind === 'earn') maturityHeadline = 'Return activity'
  if (activity.kind === 'withdraw') maturityHeadline = 'Withdrawal activity'

  return {
    maturityHeadline,
    progressPercent: 50,
    progressRangeLabel: activity.dateLabel,
    amountInvested: activity.kind === 'invest' ? activity.amountDisplay : profile.activeInvestmentsTotal,
    expectedReturns: activity.kind === 'earn' ? activity.amountDisplay : '—',
    totalPayout: activity.amountDisplay,
    investmentDateLabel: activity.dateLabel,
    maturityDateLabel: '—',
    statusLabel: 'Active',
  }
}

function defaultInvestmentDetailFromLineItem(
  item: InvestmentLineItem,
  section: 'active' | 'history',
): InvestmentDetailFields {
  const isHistory = section === 'history'
  const invested = item.amount.endsWith('.00') ? item.amount : `${item.amount}.00`
  return {
    maturityHeadline: isHistory ? 'Investment completed' : 'Active investment',
    progressPercent: isHistory ? 100 : 60,
    progressRangeLabel: item.dateLabel,
    amountInvested: invested,
    expectedReturns: '4.5%',
    totalPayout: invested,
    investmentDateLabel: item.dateLabel,
    maturityDateLabel: isHistory ? item.dateLabel : '—',
    statusLabel: isHistory ? 'Completed' : 'Active',
  }
}

function cloneInvestorProfile(profile: InvestorProfileDetail): InvestorProfileDetail {
  return {
    ...profile,
    activeInvestments: profile.activeInvestments.map((x) => ({ ...x })),
    investmentHistory: profile.investmentHistory.map((x) => ({ ...x })),
    activity: profile.activity.map((x) => ({ ...x })),
  }
}

export type AdminInvestorsDataState = {
  tableRows: InvestorTableRow[]
  profilesById: Record<string, InvestorProfileDetail>
  investmentRecordDetails: Record<string, InvestmentDetailFields>
}

/** Seed for `adminInvestors` Redux slice (detached copies safe for Immer). */
export function getAdminInvestorsInitialState(): AdminInvestorsDataState {
  const profilesById: Record<string, InvestorProfileDetail> = {}
  for (const row of INVESTOR_TABLE_ROWS) {
    profilesById[row.id] = cloneInvestorProfile(profileFromRow(row))
  }

  return {
    tableRows: INVESTOR_TABLE_ROWS.map((r) => ({ ...r })),
    profilesById,
    investmentRecordDetails: {
      ...ACTIVITY_INVESTMENT_DETAIL,
      ...LINE_ITEM_INVESTMENT_DETAIL,
    },
  }
}

/** Resolves activity id (`ac*`) or pool line id (`a*`, `h*`) using template map from Redux. */
export function resolveInvestmentActivityDetail(
  profile: InvestorProfileDetail,
  recordId: string,
  investmentRecordDetails: Record<string, InvestmentDetailFields>,
): InvestmentActivityDetail | null {
  const activity = profile.activity.find((a) => a.id === recordId)
  if (activity) {
    const fields =
      investmentRecordDetails[recordId] ?? defaultInvestmentDetailFromActivity(activity, profile)
    return {
      ...fields,
      activityId: recordId,
      investorId: profile.id,
      investorName: profile.displayName,
    }
  }

  const activeItem = profile.activeInvestments.find((i) => i.id === recordId)
  if (activeItem) {
    const fields =
      investmentRecordDetails[recordId] ?? defaultInvestmentDetailFromLineItem(activeItem, 'active')
    return {
      ...fields,
      activityId: recordId,
      investorId: profile.id,
      investorName: profile.displayName,
    }
  }

  const historyItem = profile.investmentHistory.find((i) => i.id === recordId)
  if (historyItem) {
    const fields =
      investmentRecordDetails[recordId] ?? defaultInvestmentDetailFromLineItem(historyItem, 'history')
    return {
      ...fields,
      activityId: recordId,
      investorId: profile.id,
      investorName: profile.displayName,
    }
  }

  return null
}
