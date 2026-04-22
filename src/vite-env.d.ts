/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** WalletConnect / Reown Cloud project id — enables Ledger & QR-based wallets */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
  /** API root including `/api`, e.g. http://127.0.0.1:8000/api — see http://127.0.0.1:8000/redoc/ */
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTH_EIP712_DOMAIN_NAME?: string
  readonly VITE_AUTH_EIP712_DOMAIN_VERSION?: string
  readonly VITE_AUTH_EIP712_VERIFYING_CONTRACT?: `0x${string}`
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
