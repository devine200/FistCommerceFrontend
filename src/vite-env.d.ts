/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** WalletConnect / Reown Cloud project id — enables Ledger & QR-based wallets */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
