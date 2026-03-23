import React from 'react'

import logo from '@/assets/logo.png'
import metamaskIcon from '@/assets/metamask.png'
import zerionIcon from '@/assets/zerion.png'
import ledgerIcon from '@/assets/ledger.png'
import phantomIcon from '@/assets/phantom.png'

type WalletId = 'metamask' | 'zerion' | 'ledger' | 'phantom'

interface ConnectWalletProps {
  onContinue?: () => void
}

const ConnectWallet = ({ onContinue }: ConnectWalletProps) => {
  const [connectedWalletId, setConnectedWalletId] = React.useState<WalletId | null>('metamask')

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 mb-8">
        <img src={logo} alt="logo" className="inline-block w-[58px] h-[48px]" />
        <h3 className="text-black font-bold text-[20px]">Connect Your Wallet</h3>
        <p className="text-[#6B7488]">
          Link your Web3 wallet to securely manage transactions, investments, and loan repayments on the platform.
        </p>
      </div>

      <div className="flex flex-col">
        {wallets.map((wallet) => {
          const isConnected = wallet.id === connectedWalletId

          return (
            <div
              key={wallet.id}
              className="flex items-center justify-between py-3 border-b border-[#EAEAEA] last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <img src={wallet.iconSrc} alt={`${wallet.label} icon`} className="inline-block w-[22px] h-[22px]" />
                <span className="text-black font-bold">{wallet.label}</span>
              </div>

              <button
                type="button"
                onClick={() => setConnectedWalletId(wallet.id)}
                className={
                  isConnected
                    ? 'bg-[#195EBC] text-white rounded-full px-6 py-2'
                    : 'bg-[#F5F5F5] text-[#6B7488] border border-[#EAEAEA] rounded-full px-6 py-2'
                }
              >
                {isConnected ? 'Connected' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-[#6B7488] mt-4">
        Don&apos;t see your wallet?{' '}
        <a href="#" className="text-[#195EBC] underline" onClick={(e) => e.preventDefault()}>
          Connect to another wallet.
        </a>
      </p>

      <button
        type="button"
        onClick={onContinue}
        disabled={!connectedWalletId}
        className="bg-[#195EBC] text-white px-4 py-3 rounded-md w-full mt-1 disabled:opacity-60"
      >
        Continue
      </button>
    </div>
  )
}

export default ConnectWallet