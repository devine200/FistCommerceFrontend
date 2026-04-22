import { useCallback, useState } from 'react'
import { useConnection, useDisconnect } from 'wagmi'
import { arbitrum, mainnet, sepolia } from 'wagmi/chains'

import walletIcon from '@/assets/Icon (1).png'

const CHAIN_LABEL: Record<number, string> = {
  [arbitrum.id]: arbitrum.name,
  [mainnet.id]: mainnet.name,
  [sepolia.id]: sepolia.name,
}

function connectorDisplayName(connector: { id: string; name: string } | null | undefined): string {
  if (!connector) return 'Wallet'
  const { id, name } = connector
  if (name && name.trim()) return name
  const byId: Record<string, string> = {
    metaMask: 'MetaMask',
    phantom: 'Phantom',
    walletConnect: 'WalletConnect',
  }
  return byId[id] ?? id
}

const InvestorProfileWalletsTabContent = () => {
  const { status, address, chainId, connector } = useConnection()
  const { disconnectAsync, isPending: disconnectPending } = useDisconnect()
  const [copied, setCopied] = useState(false)

  const connected = status === 'connected' && Boolean(address)
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
    await disconnectAsync()
  }

  return (
    <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[#4D5D80] text-[28px] font-semibold leading-tight">Connected Wallet</h2>
      </div>

      {!connected ? (
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
                    {connectorDisplayName(connector)}
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
              <p className="text-[#8B92A3] text-[12px]">Balance</p>
              <div className="mt-1 flex flex-col gap-2 sm:items-end">
                <p className="text-[#0B1220] text-[30px] font-semibold leading-tight">—</p>
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
