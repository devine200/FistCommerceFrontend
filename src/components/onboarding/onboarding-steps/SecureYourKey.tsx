import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import EmbeddedWalletKeyBackup from '@/components/wallet/EmbeddedWalletKeyBackup'
import { useAppDispatch } from '@/store/hooks'
import { acknowledgeKeyBackup } from '@/store/slices/keyBackupSlice'
import { useActiveWallet } from '@/wallet/useActiveWallet'

function roleFromPath(pathname: string): 'investor' | 'merchant' {
  return pathname.includes('/onboarding/merchant/') ? 'merchant' : 'investor'
}

/**
 * Onboarding step (embedded/email wallets only): require the user to back up their private key via
 * Privy's secure export before creating a profile. External-wallet users never reach this step; if
 * one lands here directly, we forward them to identity verification.
 */
export default function SecureYourKey() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { address, walletClientType, ready } = useActiveWallet()

  const [acknowledged, setAcknowledged] = useState(false)

  const role = roleFromPath(location.pathname)
  const verifyIdentityPath = `/onboarding/${role}/verify-identity`
  const isEmbedded = walletClientType === 'privy'

  // External wallets manage their own keys — skip straight to the next step.
  if (ready && !isEmbedded) {
    return <Navigate to={verifyIdentityPath} replace />
  }

  const handleContinue = () => {
    if (!acknowledged || !address) return
    dispatch(acknowledgeKeyBackup({ address }))
    navigate(verifyIdentityPath)
  }

  return (
    <div className="w-full flex justify-center lg:justify-start">
      <div className="w-full max-w-[560px] lg:max-w-none flex flex-col min-h-[520px] sm:min-h-[560px] lg:min-h-0">
        <div className="flex flex-col gap-2 mb-6 lg:mb-8">
          <h3 className="text-black font-bold text-[20px]">Secure your wallet</h3>
          <p className="text-[#6B7488]">
            You signed in with an embedded wallet, so you are fully in control of your funds. Back up
            your private key now — before setting up your profile — so you never lose access.
          </p>
        </div>

        <EmbeddedWalletKeyBackup
          title="Reveal and save your private key"
          description="Click reveal to open the secure window, then copy your private key and store it somewhere safe and private (a password manager or offline). You will need it to restore your wallet."
        />

        <label className="mt-5 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#195EBC]"
          />
          <span className="text-[#374151] text-[14px] leading-relaxed">
            I have securely saved my private key and understand that Fist Commerce cannot recover it
            if it is lost. I am solely responsible for keeping it safe.
          </span>
        </label>

        <div className="mt-auto lg:mt-6 pt-5 lg:pt-0">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!acknowledged || !ready || !address}
            className="bg-[#195EBC] text-white px-4 py-3 rounded-md w-full mt-1 disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
