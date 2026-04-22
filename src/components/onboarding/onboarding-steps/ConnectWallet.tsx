import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useChainId, useConnect, useConnection, useConnectors, useDisconnect, useSignTypedData } from 'wagmi'

import { ApiRequestError, formatApiRequestErrorPlain, getApiBaseUrl } from '@/api/client'
import { createWalletLoginSignable, postWalletLogin } from '@/api/walletSession'
import metamaskIcon from '@/assets/metamask.png'
import zerionIcon from '@/assets/zerion.png'
import ledgerIcon from '@/assets/ledger.png'
import phantomIcon from '@/assets/phantom.png'
import { applyWalletLoginResponse } from '@/session/loginBridge'
import { unlockAfterConnectWallet } from '@/state/session'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { setInvestorWalletDisplay } from '@/store/slices/investorDashboardSlice'
import { setMerchantWalletDisplay } from '@/store/slices/merchantDashboardSlice'

type WalletId = 'metamask' | 'zerion' | 'ledger' | 'phantom'

/** Maps onboarding UI rows to wagmi connector `id` values from `src/wagmi.ts`. */
const WALLET_CONNECTOR_IDS: Record<WalletId, string> = {
  metamask: 'metaMask',
  zerion: 'walletConnect',
  ledger: 'walletConnect',
  phantom: 'phantom',
}

function truncateAddress(address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function isWalletSignRejected(e: unknown): boolean {
  if (!(e instanceof Error)) return false
  if (e.name === 'UserRejectedRequestError') return true
  const code = (e as { code?: number }).code
  if (code === 4001) return true
  return /user rejected|denied transaction signature|request rejected/i.test(e.message)
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
  const { signTypedDataAsync } = useSignTypedData()
  const chainId = useChainId()
  const [rowError, setRowError] = React.useState<string | null>(null)
  const [authInFlight, setAuthInFlight] = React.useState(false)
  const [connectingWalletId, setConnectingWalletId] = React.useState<WalletId | null>(null)
  /** Zerion and Ledger share the WalletConnect connector; track which row opened the session. */
  const [walletConnectChoice, setWalletConnectChoice] = React.useState<'zerion' | 'ledger' | null>(null)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const walletConnectConfigured = Boolean(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)

  React.useEffect(() => {
    if (connection.status !== 'connected' || !connection.address) return
    const display = truncateAddress(connection.address)
    if (role === 'merchant') dispatch(setMerchantWalletDisplay(display))
    else dispatch(setInvestorWalletDisplay(display))
  }, [connection.status, connection.address, dispatch, role])

  React.useEffect(() => {
    if (connection.status === 'disconnected') setWalletConnectChoice(null)
  }, [connection.status])

  const activeWalletId = React.useMemo((): WalletId | null => {
    if (connection.status !== 'connected' || !connection.connector) return null
    const id = connection.connector.id
    if (id === 'walletConnect') {
      return walletConnectChoice === 'zerion' || walletConnectChoice === 'ledger' ? walletConnectChoice : null
    }
    const entry = (Object.entries(WALLET_CONNECTOR_IDS) as [WalletId, string][]).find(
      ([, connectorId]) => connectorId === id,
    )
    return entry?.[0] ?? null
  }, [connection.status, connection.connector, walletConnectChoice])

  const handleContinue = async () => {
    if (onContinue) return onContinue()

    if (connection.status !== 'connected' || !connection.address) return

    if (!role) {
      setRowError('Choose investor or merchant on the previous step before signing in.')
      return
    }

    if (!getApiBaseUrl()) {
      setRowError(
        'API base URL is not configured. Set VITE_API_BASE_URL in your .env file (see .env.example) and restart the dev server.',
      )
      return
    }

    setRowError(null)
    setAuthInFlight(true)
    try {
      const address = connection.address as `0x${string}`
      const signable = createWalletLoginSignable(chainId, address)
      const signature = await signTypedDataAsync({
        domain: signable.domain,
        types: signable.types,
        primaryType: signable.primaryType,
        message: signable.message,
        account: address,
      })
      const login = await postWalletLogin({
        signedMessage: signable.signedMessageForApi,
        signature,
        signerAddress: address,
        role,
      })
      const returningUser = login.registered || login.onboarded
      if (returningUser) {
        applyWalletLoginResponse(
          dispatch,
          {
            access_token: login.accessToken,
            refresh_token: login.refreshToken,
            registered: login.registered,
            onboarded: login.onboarded,
            kycStatus: login.kycStatus,
            user: login.user ?? undefined,
            role: login.roleFromApi ?? undefined,
          },
          { fallbackRole: role },
        )
        navigate('/continue')
        return
      }

      dispatch(patchAuth({ accessToken: login.accessToken, refreshToken: login.refreshToken ?? null }))
      unlockAfterConnectWallet(role)

      if (pathname.startsWith('/onboarding/investor')) {
        navigate('/onboarding/investor/verify-identity')
        return
      }

      if (pathname.startsWith('/onboarding/merchant')) {
        navigate('/onboarding/merchant/verify-identity')
        return
      }
    } catch (e) {
      if (isWalletSignRejected(e)) {
        setRowError('Signature was cancelled. Please try again when you are ready to sign in.')
      } else if (e instanceof ApiRequestError) {
        setRowError(formatApiRequestErrorPlain(e))
      } else {
        const message = e instanceof Error ? e.message : 'Could not complete wallet sign-in.'
        setRowError(message)
      }
      console.error(e)
    } finally {
      setAuthInFlight(false)
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

    if ((walletId === 'zerion' || walletId === 'ledger') && !walletConnectConfigured) {
      setRowError(
        'Zerion and Ledger use WalletConnect. Add VITE_WALLETCONNECT_PROJECT_ID to a .env file in the project root (copy from .env.example), get a free project id at https://dashboard.reown.com , then restart the dev server.',
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
      if (walletId === 'zerion' || walletId === 'ledger') {
        setWalletConnectChoice(walletId)
      } else {
        setWalletConnectChoice(null)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not connect wallet.'
      setRowError(message)
      console.error(e)
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
          <p className="text-[14px] text-red-600 mb-4 whitespace-pre-wrap" role="alert">
            {displayError}
          </p>
        ) : null}

        <div className="flex flex-col">
          {wallets.map((wallet) => {
            const unavailable =
              (wallet.id === 'ledger' || wallet.id === 'zerion') && !walletConnectConfigured
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
            onClick={() => void handleContinue()}
            disabled={connection.status !== 'connected' || authInFlight}
            className="bg-[#195EBC] text-white px-4 py-3 rounded-md w-full mt-1 disabled:opacity-60"
          >
            {authInFlight ? 'Signing in…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet
