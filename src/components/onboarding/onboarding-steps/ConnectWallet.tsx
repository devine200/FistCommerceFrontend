import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { sepolia } from 'viem/chains'
import { usePrivy } from '@privy-io/react-auth'

import { ApiRequestError, formatApiRequestErrorPlain, getApiBaseUrl } from '@/api/client'
import { createWalletLoginSignable, postWalletLogin } from '@/api/walletSession'
import privyIcon from '@/assets/Icon (1).png'
import { applyWalletLoginResponse } from '@/session/loginBridge'
import { unlockAfterConnectWallet } from '@/state/session'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'
import { setInvestorWalletDisplay } from '@/store/slices/investorDashboardSlice'
import { setMerchantWalletDisplay } from '@/store/slices/merchantDashboardSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'
import { ensureWalletChain, getWalletClientFromPrivyWallet } from '@/wallet/viemClients'

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

/** EIP-1193: chain not added in the wallet — user must add Sepolia or approve add-network. */
function isChainNotAddedError(e: unknown): boolean {
  const code = (e as { code?: number }).code
  return code === 4902
}

interface ConnectWalletProps {
  onContinue?: () => void
}

export default function ConnectWallet({ onContinue }: ConnectWalletProps) {
  const dispatch = useAppDispatch()
  const role = useAppSelector((s) => s.auth.role)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { ready: privyReady, login, connectWallet } = usePrivy()
  const { wallet, address, isConnected, walletClientType, ready: walletsReady } = useActiveWallet()

  const [rowError, setRowError] = React.useState<string | null>(null)
  const [authInFlight, setAuthInFlight] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)

  React.useEffect(() => {
    if (!isConnected || !address) return
    const display = truncateAddress(address)
    if (role === 'merchant') dispatch(setMerchantWalletDisplay(display))
    else dispatch(setInvestorWalletDisplay(display))
  }, [isConnected, address, dispatch, role])

  const handlePrivyLogin = async () => {
    setRowError(null)
    if (!privyReady) {
      setRowError('Login is still loading. Please try again in a moment.')
      return
    }
    setConnecting(true)
    try {
      await login()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not open login.'
      setRowError(message)
      console.error(e)
    } finally {
      setConnecting(false)
    }
  }

  const handleConnectExternalWallet = async () => {
    setRowError(null)
    if (!privyReady) {
      setRowError('Wallet connection is still loading. Please try again in a moment.')
      return
    }
    if (typeof connectWallet !== 'function') {
      setRowError('External wallet connection is not available in this build.')
      return
    }
    setConnecting(true)
    try {
      await connectWallet()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not connect wallet.'
      setRowError(message)
      console.error(e)
    } finally {
      setConnecting(false)
    }
  }

  const handleContinue = async () => {
    if (onContinue) return onContinue()

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

    if (!walletsReady) {
      setRowError('Wallet is still loading. Please wait a moment and try again.')
      return
    }

    if (!wallet || !address) {
      setRowError('Connect a wallet first (embedded or external) to sign in.')
      return
    }

    setRowError(null)
    setAuthInFlight(true)
    try {
      try {
        await ensureWalletChain(wallet, sepolia.id)
      } catch (e) {
        if (isWalletSignRejected(e)) {
          setRowError('Switch to Sepolia was cancelled. Approve the network change to sign in.')
          return
        }
        if (isChainNotAddedError(e)) {
          setRowError('Sepolia is not set up in this wallet. Add the Sepolia network (chain ID 11155111), then try again.')
          return
        }
        throw e
      }

      const signable = createWalletLoginSignable(sepolia.id, address as `0x${string}`)
      const walletClient = await getWalletClientFromPrivyWallet(wallet)
      const signature = await walletClient.signTypedData({
        domain: signable.domain,
        types: signable.types as any,
        primaryType: signable.primaryType,
        message: signable.message as any,
        account: address as `0x${string}`,
      })

      const loginRes = await postWalletLogin({
        signedMessage: signable.signedMessageForApi,
        signature,
        signerAddress: address,
        role,
      })

      const returningUser = loginRes.registered || loginRes.onboarded
      if (returningUser) {
        applyWalletLoginResponse(
          dispatch,
          {
            access_token: loginRes.accessToken,
            refresh_token: loginRes.refreshToken ?? undefined,
            registered: loginRes.registered,
            onboarded: loginRes.onboarded,
            kycStatus: loginRes.kycStatus,
            user: loginRes.user ?? undefined,
            role: loginRes.roleFromApi ?? undefined,
          },
          { fallbackRole: role },
        )
        navigate('/continue')
        return
      }

      dispatch(patchAuth({ accessToken: loginRes.accessToken, refreshToken: loginRes.refreshToken ?? null }))
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

  return (
    <div className="w-full flex justify-center lg:justify-start">
      <div className="w-full max-w-[560px] lg:max-w-none flex flex-col min-h-[520px] sm:min-h-[560px] lg:min-h-0">
        <div className="flex flex-col gap-2 mb-6 lg:mb-8">
          <h3 className="text-black font-bold text-[20px]">Connect Your Wallet</h3>
          <p className="text-[#6B7488]">
            Use email/Google to create an embedded wallet, or connect an external wallet (MetaMask, WalletConnect, Phantom EVM).
          </p>
        </div>

        {isConnected && address ? (
          <p className="text-[14px] text-[#195EBC] font-medium mb-4" aria-live="polite">
            Connected: <span className="font-mono">{truncateAddress(address)}</span>
            {walletClientType ? <span className="ml-2 text-[#6B7488]">({walletClientType})</span> : null}
          </p>
        ) : null}

        {rowError ? (
          <p className="text-[14px] text-red-600 mb-4 whitespace-pre-wrap" role="alert">
            {rowError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handlePrivyLogin()}
            disabled={connecting || authInFlight}
            className="flex items-center justify-between rounded-md border border-[#EAEAEA] bg-white px-4 py-3 hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img src={privyIcon} alt="" className="inline-block w-[22px] h-[22px]" />
              <span className="text-black font-bold truncate">Continue with Google or email</span>
            </div>
            <span className="text-[14px] text-[#6B7488]">{connecting ? 'Opening…' : 'Login'}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleConnectExternalWallet()}
            disabled={connecting || authInFlight}
            className="flex items-center justify-between rounded-md border border-[#EAEAEA] bg-white px-4 py-3 hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            <span className="text-black font-bold truncate">Connect external wallet</span>
            <span className="text-[14px] text-[#6B7488]">{connecting ? 'Opening…' : 'Connect'}</span>
          </button>
        </div>

        <div className="mt-auto lg:mt-6 pt-5 lg:pt-0">
          <button
            type="button"
            onClick={() => void handleContinue()}
            disabled={!isConnected || authInFlight}
            className="bg-[#195EBC] text-white px-4 py-3 rounded-md w-full mt-1 disabled:opacity-60"
          >
            {authInFlight ? 'Signing in…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
