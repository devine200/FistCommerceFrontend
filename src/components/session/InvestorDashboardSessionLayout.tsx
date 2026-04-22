import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useConnection } from 'wagmi'
import { useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'

import DashboardErrorModal from '@/components/dashboard/shared/DashboardErrorModal'
import DashboardFullPageLoading from '@/components/dashboard/shared/DashboardFullPageLoading'
import DashboardSessionGuard from '@/components/session/DashboardSessionGuard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { refreshInvestorDashboard, setInvestorWalletDisplay } from '@/store/slices/investorDashboardSlice'

function topBarWalletFromAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function InvestorDashboardSessionLayout() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const status = useAppSelector((s) => s.investorDashboard.status)
  const error = useAppSelector((s) => s.investorDashboard.error)
  const { status: walletStatus, address, chainId } = useConnection()
  const { switchChainAsync } = useSwitchChain()
  const [errorOpen, setErrorOpen] = useState(false)
  const [dismissedWrongChainId, setDismissedWrongChainId] = useState<number | null>(null)
  const didKickoffRef = useRef(false)

  /** Keep dashboard top-bar wallet in sync with wagmi (ConnectWallet only runs during onboarding). */
  useEffect(() => {
    if (walletStatus !== 'connected' || !address) return
    dispatch(setInvestorWalletDisplay(topBarWalletFromAddress(address)))
  }, [dispatch, walletStatus, address])

  useEffect(() => {
    // When the session changes (reload / login / logout), allow a new kickoff.
    didKickoffRef.current = false
  }, [accessToken])

  const isWrongNetwork = walletStatus === 'connected' && Boolean(address) && chainId != null && chainId !== sepolia.id
  useEffect(() => {
    if (!isWrongNetwork) {
      setDismissedWrongChainId(null)
      return
    }
    // If the user switches chains again, allow the modal to show again.
    if (dismissedWrongChainId !== null && dismissedWrongChainId !== chainId) {
      setDismissedWrongChainId(null)
    }
  }, [chainId, dismissedWrongChainId, isWrongNetwork])

  useEffect(() => {
    if (didKickoffRef.current) return
    if (status !== 'idle') return
    if (!accessToken?.trim()) return
    didKickoffRef.current = true
    void dispatch(refreshInvestorDashboard())
  }, [dispatch, status, accessToken])

  useEffect(() => {
    if (status === 'failed') setErrorOpen(true)
  }, [status])

  const errorMessage = useMemo(() => {
    const msg = error?.trim()
    return msg?.length ? msg : 'Dashboard sync failed. Please check your connection and try again.'
  }, [error])

  return (
    <>
      <DashboardSessionGuard />
      <DashboardErrorModal
        open={isWrongNetwork && dismissedWrongChainId !== chainId}
        title="Wrong network"
        message={`This dashboard uses Sepolia testnet contracts. Please switch your wallet back to Sepolia.`}
        retryLabel="Switch to Sepolia"
        primaryLabel="Dismiss"
        onClose={() => setDismissedWrongChainId(chainId ?? null)}
        onRetry={() => void switchChainAsync({ chainId: sepolia.id })}
      />
      <DashboardErrorModal
        open={errorOpen && status === 'failed'}
        message={errorMessage}
        onClose={() => setErrorOpen(false)}
        onRetry={() => void dispatch(refreshInvestorDashboard())}
      />
      {status === 'loading' ? (
        <div className="fixed inset-0 z-75">
          <DashboardFullPageLoading label="Syncing investor dashboard…" />
        </div>
      ) : null}
      <Outlet />
    </>
  )
}
