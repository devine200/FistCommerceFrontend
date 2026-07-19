import { useExportEmbeddedWallet } from '@/wallet/useExportEmbeddedWallet'

/** How to import a private key into a self-custody wallet (MetaMask). */
const IMPORT_GUIDE_URL =
  'https://support.metamask.io/managing-my-wallet/accounts-and-addresses/how-to-import-an-account/'

/** Decorative masked value only — NEVER real key material (the app cannot access the key). */
const MASKED_PLACEHOLDER = '•'.repeat(64)

type EmbeddedWalletKeyBackupProps = {
  title?: string
  description?: string
  className?: string
}

/**
 * Renders the private-key backup UI for embedded (email/Google) wallets and nothing for external
 * wallets. The reveal button hands off to Privy's secure export modal — the key is shown and copied
 * inside Privy's isolated iframe, never in this app. The blurred value below is a fixed decorative
 * placeholder, not the user's key.
 */
export function EmbeddedWalletKeyBackup({
  title = 'Back up your private key',
  description = 'Your account uses an embedded wallet. Save its private key somewhere safe and private — anyone with it controls your funds, and it cannot be recovered if lost.',
  className,
}: EmbeddedWalletKeyBackupProps) {
  const { exportKey, isEmbedded, ready, pending, error } = useExportEmbeddedWallet()

  if (!isEmbedded) return null

  return (
    <section
      className={[
        'rounded-[8px] border border-[#E6E8EC] bg-white p-4 sm:p-5',
        className ?? '',
      ].join(' ')}
    >
      <h2 className="text-[#4D5D80] text-[22px] font-semibold leading-tight">{title}</h2>
      <p className="mt-2 text-[#6B7488] text-[14px] leading-relaxed">{description}</p>

      <div className="mt-3 rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5">
        <p className="text-[#92400E] text-[13px] leading-relaxed">
          Keep this information extremely safe. Never share it with anyone, including Fist Commerce
          staff. We can never see it and cannot help you recover it if it is lost or stolen.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[#8B92A3] text-[12px] font-medium">Private key</p>
        <div className="mt-1 flex items-center gap-2">
          <p
            aria-hidden="true"
            className="min-w-0 flex-1 select-none truncate rounded-[6px] border border-[#E6E8EC] bg-[#F9FAFB] px-3 py-2 font-mono text-[13px] text-[#0B1220] blur-[5px]"
          >
            {MASKED_PLACEHOLDER}
          </p>
        </div>
        <p className="mt-1 text-[#8B92A3] text-[12px]">
          Hidden for your security. Reveal it in the secure Privy window to view and copy it.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void exportKey()}
          disabled={pending || !ready}
          className="rounded-[6px] bg-[#195EBC] px-5 py-2.5 text-white text-[14px] font-medium hover:bg-[#144a96] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Opening…' : 'Reveal & copy private key'}
        </button>
        <a
          href={IMPORT_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#195EBC] text-[13px] font-medium underline underline-offset-2 hover:text-[#144a96]"
        >
          How to import it into a wallet
        </a>
      </div>

      {error ? (
        <p className="mt-3 text-[#DC2626] text-[13px]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}

export default EmbeddedWalletKeyBackup
