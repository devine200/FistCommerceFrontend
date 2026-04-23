/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** WalletConnect / Reown Cloud project id — enables Ledger & QR-based wallets */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
  /** API root including `/api`, e.g. http://127.0.0.1:8000/api — see http://127.0.0.1:8000/redoc/ */
  readonly VITE_API_BASE_URL?: string
  /** Privy App ID (public) */
  readonly VITE_PRIVY_APP_ID?: string
  /**
   * Privy App Secret (DO NOT use in frontend).
   * NOTE: Any `VITE_*` env var is bundled into client builds.
   */
  readonly VITE_PRIVY_APP_SECRET?: string
  /**
   * Google OAuth Web Client ID (public). Optional — copy the same value into the Privy dashboard
   * for custom Google credentials; the Privy SDK does not read this at runtime.
   */
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string
  /** @deprecated Use `VITE_GOOGLE_OAUTH_CLIENT_ID` — same Google Web Client ID for Privy dashboard */
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_AUTH_EIP712_DOMAIN_NAME?: string
  readonly VITE_AUTH_EIP712_DOMAIN_VERSION?: string
  readonly VITE_AUTH_EIP712_VERIFYING_CONTRACT?: `0x${string}`
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
