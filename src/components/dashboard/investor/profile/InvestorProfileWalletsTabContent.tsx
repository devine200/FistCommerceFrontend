import { useCallback, useMemo, useState } from 'react'
import { useLogout } from '@privy-io/react-auth'
import { arbitrum, mainnet, sepolia } from 'viem/chains'

import walletIcon from '@/assets/Icon (1).png'
import { useTestnetContracts } from '@/hooks/useTestnetContracts'
import { disconnectPrivySession } from '@/session/disconnectPrivySession'
import { resetUserSession } from '@/session/resetUserSession'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useActiveWallet } from '@/wallet/useActiveWallet'

const CHAIN_LABEL: Record<number, string> = {
  [arbitrum.id]: arbitrum.name,
  [mainnet.id]: mainnet.name,
  [sepolia.id]: sepolia.name,
}

function walletClientTypeLabel(walletClientType: string | null | undefined): string {
  if (!walletClientType) return 'Wallet'
  const byType: Record<string, string> = {
    privy: 'Embedded Wallet',
    metamask: 'MetaMask',
    phantom: 'Phantom',
    wallet_connect: 'WalletConnect',
    coinbase_wallet: 'Coinbase Wallet',
  }
  return byType[walletClientType] ?? walletClientType
}

const InvestorProfileWalletsTabContent = () => {
  const dispatch = useAppDispatch()
  const { logout } = useLogout()
  const { isConnected, address, walletClientType, wallet } = useActiveWallet()
  const chainId = useAppSelector((s) => s.wallet.chainId)
  const [disconnectPending, setDisconnectPending] = useState(false)
  const [copied, setCopied] = useState(false)
  const contracts = useTestnetContracts()

  const walletTokenBalanceLabel = useMemo(() => {
    if (!contracts.isConnected) return 'Connect your wallet to view on-chain mock token balance (Sepolia).'
    if (contracts.isContractsLoading) return 'Loading balance…'
    const formatted = contracts.mockTokenBalanceFormatted
    const amountLine = formatted === '—' ? 'Wallet Balance: —' : `Wallet Balance: $${formatted}`
    if (!contracts.isCorrectNetwork) {
      return `${amountLine} (Sepolia contract view; switch your wallet to ${contracts.testnetChain.name} for deposits and withdrawals.)`
    }
    return amountLine
  }, [
    contracts.isConnected,
    contracts.isContractsLoading,
    contracts.isCorrectNetwork,
    contracts.mockTokenBalanceFormatted,
    contracts.testnetChain.name,
  ])

  const chainLabel =
    chainId != null ? (CHAIN_LABEL[chainId] ?? `Chain ${chainId}`) : '—'

  const copyAddress = useCallback(async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard denied or unavailable */
    }
  }, [address])

  const handleDisconnect = async () => {
    setDisconnectPending(true)
    try {
      await disconnectPrivySession(wallet, logout)
      resetUserSession(dispatch)
      window.location.replace('/onboarding/choose-role')
    } catch (e) {
      console.error(e)
    } finally {
      setDisconnectPending(false)
    }
  }

  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[#4D5D80] text-[28px] font-semibold leading-tight">Connected Wallet</h2>
      </div>

      {!isConnected ? (
        <p className="mt-4 text-[#6B7488] text-[14px] leading-relaxed">No wallet connected.</p>
      ) : (
        <article className="mt-4 rounded-[6px] border border-[#195EBC] bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-[6px] bg-[#EEF2F6] flex items-center justify-center">
                <img src={walletIcon} alt="" className="h-5 w-5 object-contain" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#0B1220] text-[24px] font-semibold leading-tight">
                    {walletClientTypeLabel(walletClientType)}
                  </p>
                  <span className="rounded-full bg-[#E8EFFB] px-2 py-0.5 text-[11px] text-[#195EBC] font-medium">
                    Primary
                  </span>
                  <span className="text-[#16A34A] text-[11px] font-medium">Connected</span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 min-w-0">
                  <p className="text-[#0B1220] text-[11px] sm:text-[12px] break-all font-mono">{address}</p>
                  <button
                    type="button"
                    onClick={() => void copyAddress()}
                    className="shrink-0 rounded-[4px] border border-[#E6E8EC] bg-white px-2 py-1 text-[11px] font-medium text-[#195EBC] hover:bg-[#F9FAFB] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#195EBC]"
                    aria-label={copied ? 'Address copied' : 'Copy wallet address'}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-1 text-[#8B92A3] text-[12px]">{chainLabel}</p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <p className="text-[#8B92A3] text-[12px]">Balance (on-chain)</p>
              <div className="mt-1 flex flex-col gap-2 sm:items-end">
                <p className="text-[#0B1220] text-[22px] sm:text-[26px] font-semibold leading-tight max-w-[min(100%,20rem)] sm:max-w-xs">
                  {walletTokenBalanceLabel}
                </p>
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={disconnectPending}
                  className="text-[#DC2626] text-[12px] underline disabled:opacity-50 disabled:no-underline"
                >
                  {disconnectPending ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}

export default InvestorProfileWalletsTabContent
