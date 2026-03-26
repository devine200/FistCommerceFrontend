import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import metamaskIcon from '@/assets/metamask.png'
import zerionIcon from '@/assets/zerion.png'
import ledgerIcon from '@/assets/ledger.png'
import phantomIcon from '@/assets/phantom.png'

type WalletId = 'metamask' | 'zerion' | 'ledger' | 'phantom'

interface ConnectWalletProps {
  onContinue?: () => void
}

const ConnectWallet = ({ onContinue }: ConnectWalletProps) => {
  const [connectedWalletId, setConnectedWalletId] = React.useState<WalletId | null>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()

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

  return (
    <div className="w-full flex justify-center lg:justify-start">
      <div className="w-full max-w-[560px] lg:max-w-none flex flex-col min-h-[520px] sm:min-h-[560px] lg:min-h-0">
        <div className="flex flex-col gap-2 mb-6 lg:mb-8">
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
                className="flex items-center justify-between py-3 sm:py-4 border-b border-[#EAEAEA] last:border-b-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={wallet.iconSrc} alt={`${wallet.label} icon`} className="inline-block w-[22px] h-[22px]" />
                  <span className="text-black font-bold truncate">{wallet.label}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setConnectedWalletId(wallet.id)}
                  className={[
                    'rounded-full px-6 py-2 text-[14px] font-medium whitespace-nowrap',
                    isConnected
                      ? 'bg-[#195EBC] text-white'
                      : 'bg-[#F5F5F5] text-[#6B7488] border border-[#EAEAEA]',
                  ].join(' ')}
                >
                  {isConnected ? 'Connected' : 'Connect'}
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
            disabled={!connectedWalletId}
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