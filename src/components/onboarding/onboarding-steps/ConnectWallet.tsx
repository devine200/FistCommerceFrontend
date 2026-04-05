import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'

import metamaskIcon from '@/assets/metamask.png'
import zerionIcon from '@/assets/zerion.png'
import ledgerIcon from '@/assets/ledger.png'
import phantomIcon from '@/assets/phantom.png'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setInvestorWalletDisplay } from '@/store/slices/investorDashboardSlice'
import { setMerchantWalletDisplay } from '@/store/slices/merchantDashboardSlice'

type WalletId = 'metamask' | 'zerion' | 'ledger' | 'phantom'

/** Maps onboarding UI rows to wagmi connector `id` values from `src/wagmi.ts`. */
const WALLET_CONNECTOR_IDS: Record<WalletId, string> = {
  metamask: 'metaMaskSDK',
  zerion: 'zerion',
  ledger: 'walletConnect',
  phantom: 'phantom',
}

function truncateAddress(address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface ConnectWalletProps {
  onContinue?: () => void
}

const ConnectWallet = ({ onContinue }: ConnectWalletProps) => {
  const dispatch = useAppDispatch()
  const role = useAppSelector((s) => s.auth.role)
  const connection = useConnection()
  const connectors = useConnectors()
  const { connectAsync, error: connectError, reset: resetConnect } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const [rowError, setRowError] = React.useState<string | null>(null)
  const [connectingWalletId, setConnectingWalletId] = React.useState<WalletId | null>(null)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const ledgerConfigured = Boolean(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)

  React.useEffect(() => {
    if (connection.status !== 'connected' || !connection.address) return
    const display = truncateAddress(connection.address)
    if (role === 'merchant') dispatch(setMerchantWalletDisplay(display))
    else dispatch(setInvestorWalletDisplay(display))
  }, [connection.status, connection.address, dispatch, role])

  const activeWalletId = React.useMemo((): WalletId | null => {
    if (connection.status !== 'connected' || !connection.connector) return null
    const id = connection.connector.id
    const entry = (Object.entries(WALLET_CONNECTOR_IDS) as [WalletId, string][]).find(
      ([, connectorId]) => connectorId === id,
    )
    return entry?.[0] ?? null
  }, [connection.status, connection.connector])

  const handleContinue = () => {
    if (onContinue) return onContinue()

    if (pathname.startsWith('/onboarding/investor')) {
      navigate('/onboarding/investor/verify-identity')
      return
    }

    if (pathname.startsWith('/onboarding/merchant')) {
      navigate('/onboarding/merchant/verify-identity')
      return
    }
  }

  const wallets: Array<{
    id: WalletId
    label: string
    iconSrc: string
  }> = [
    { id: 'metamask', label: 'Metamask', iconSrc: metamaskIcon },
    { id: 'zerion', label: 'Zerion', iconSrc: zerionIcon },
    { id: 'ledger', label: 'Ledger', iconSrc: ledgerIcon },
    { id: 'phantom', label: 'Phantom', iconSrc: phantomIcon },
  ]

  const resolveConnector = (walletId: WalletId) => {
    const wantedId = WALLET_CONNECTOR_IDS[walletId]
    return connectors.find((c) => c.id === wantedId)
  }

  const handleWalletConnect = async (walletId: WalletId) => {
    setRowError(null)
    resetConnect()

    if (walletId === 'ledger' && !ledgerConfigured) {
      setRowError(
        'Ledger and other mobile wallets use WalletConnect. Set VITE_WALLETCONNECT_PROJECT_ID (from https://dashboard.reown.com ) in your environment.',
      )
      return
    }

    const connector = resolveConnector(walletId)
    if (!connector) {
      setRowError('This wallet is not available in this browser. Install the extension or try another option.')
      return
    }

    setConnectingWalletId(walletId)
    try {
      if (connection.status === 'connected' && connection.connector?.id !== connector.id) {
        await disconnectAsync()
      }
      await connectAsync({ connector })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not connect wallet.'
      setRowError(message)
    } finally {
      setConnectingWalletId(null)
    }
  }

  const mutationError = connectError?.message ?? null
  const displayError = rowError ?? mutationError

  return (
    <div className="w-full flex justify-center lg:justify-start">
      <div className="w-full max-w-[560px] lg:max-w-none flex flex-col min-h-[520px] sm:min-h-[560px] lg:min-h-0">
        <div className="flex flex-col gap-2 mb-6 lg:mb-8">
          <h3 className="text-black font-bold text-[20px]">Connect Your Wallet</h3>
          <p className="text-[#6B7488]">
            Link your Web3 wallet to securely manage transactions, investments, and loan repayments on the platform.
          </p>
        </div>

        {connection.status === 'connected' && connection.address ? (
          <p className="text-[14px] text-[#195EBC] font-medium mb-4" aria-live="polite">
            Connected: <span className="font-mono">{truncateAddress(connection.address)}</span>
          </p>
        ) : null}

        {displayError ? (
          <p className="text-[14px] text-red-600 mb-4" role="alert">
            {displayError}
          </p>
        ) : null}

        <div className="flex flex-col">
          {wallets.map((wallet) => {
            const unavailable = wallet.id === 'ledger' && !ledgerConfigured
            const isConnecting = connectingWalletId === wallet.id
            const isConnected = wallet.id === activeWalletId

            return (
              <div
                key={wallet.id}
                className="flex items-center justify-between py-3 sm:py-4 border-b border-[#EAEAEA] last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={wallet.iconSrc} alt={`${wallet.label} icon`} className="inline-block w-[22px] h-[22px]" />
                  <span className="text-black font-bold truncate">{wallet.label}</span>
                </div>

                <button
                  type="button"
                  disabled={unavailable || isConnecting || (isConnected && connection.status === 'connected')}
                  onClick={() => handleWalletConnect(wallet.id)}
                  className={[
                    'rounded-full px-6 py-2 text-[14px] font-medium whitespace-nowrap',
                    unavailable ? 'opacity-50 cursor-not-allowed bg-[#F5F5F5] text-[#6B7488] border border-[#EAEAEA]' : '',
                    !unavailable && isConnected
                      ? 'bg-[#195EBC] text-white'
                      : !unavailable
                        ? 'bg-[#F5F5F5] text-[#6B7488] border border-[#EAEAEA] enabled:hover:bg-[#EEF3FA]'
                        : '',
                  ].join(' ')}
                  aria-busy={isConnecting}
                >
                  {unavailable
                    ? 'Setup required'
                    : isConnecting
                      ? 'Connecting…'
                      : isConnected
                        ? 'Connected'
                        : 'Connect'}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-4 lg:mt-4">
          <p className="text-[#6B7488] text-[14px]">
            Don&apos;t see your wallet?{' '}
            <a href="#" className="text-[#195EBC] underline" onClick={(e) => e.preventDefault()}>
              Connect to another wallet.
            </a>
          </p>
        </div>

        <div className="mt-auto lg:mt-6 pt-5 lg:pt-0">
          <button
            type="button"
            onClick={handleContinue}
            disabled={connection.status !== 'connected'}
            className="bg-[#195EBC] text-white px-4 py-3 rounded-md w-full mt-1 disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet
