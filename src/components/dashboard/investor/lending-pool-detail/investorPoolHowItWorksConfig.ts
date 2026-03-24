import depositHelpDetail from '@/assets/deposit-help-detail.png'
import joinPoolHelpDetail from '@/assets/join-pool-help-detail.png'
import capitalDeploymentHelpDetail from '@/assets/capital-deployment-help-detail.png'
import earnHelpDetail from '@/assets/earn-help-detail.png'
import withdrawalHelpDetail from '@/assets/withdrawal-help-detail.png'

export type InvestorHowItWorksCard = {
  id: string
  title: string
  description: string
  imageSrc: string
}

export const INVESTOR_HOW_IT_WORKS_INTRO =
  'Fist Commerce connects on-chain capital to real merchant financing with full transparency: pooled deposits, documented loan criteria, and smart-contract rules you can verify anytime.'

export const INVESTOR_HOW_IT_WORKS_HEADING =
  'How Decentralized Lending Pools Connect Your Capital to Real-World Business Opportunities.'

export const INVESTOR_HOW_IT_WORKS_CARDS: InvestorHowItWorksCard[] = [
  {
    id: 'deposit',
    title: 'Deposit Funds',
    description:
      'Connect your wallet and deposit stablecoin into the pool. Your capital is pooled with other investors to fund qualified merchant loans.',
    imageSrc: depositHelpDetail,
  },
  {
    id: 'join',
    title: 'Join the Lending Pool',
    description:
      'Your deposit is allocated through the pool smart contract, where it becomes available for vetted borrowing requests that match the pool strategy.',
    imageSrc: joinPoolHelpDetail,
  },
  {
    id: 'deploy',
    title: 'Capital Is Deployed',
    description:
      'Approved merchants draw against the pool for purchase orders and receivables financing, with diversification and limits defined in the pool rules.',
    imageSrc: capitalDeploymentHelpDetail,
  },
  {
    id: 'earn',
    title: 'Earn Returns',
    description:
      'As merchants repay principal and interest, returns accrue to the pool. Your share reflects your contribution and the pool’s performance over time.',
    imageSrc: earnHelpDetail,
  },
  {
    id: 'withdraw',
    title: 'Withdraw or Re-Invest',
    description:
      'You can withdraw your available balance based on the pool’s liquidity terms, or choose to reinvest your earnings to continue growing your capital.',
    imageSrc: withdrawalHelpDetail,
  },
]
