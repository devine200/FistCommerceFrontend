This is a [Vite](https://vitejs.dev) project bootstrapped with [`create-wagmi`](https://github.com/wevm/wagmi/tree/main/packages/create-wagmi).

## Environment variables

Copy `.env.example` to `.env` and fill in required values.

- **`VITE_PRIVY_APP_ID`**: Privy App ID used for social login + embedded wallets.

- **`VITE_GOOGLE_OAUTH_CLIENT_ID`**: Public Google **Web** OAuth client id (for your own records). The React SDK does **not** use this value to authenticate; you must also paste the same client id and the Google client **secret** into the [Privy dashboard](https://dashboard.privy.io/) under **Login methods → Google** (custom credentials), per [Privy’s OAuth setup guide](https://docs.privy.io/basics/get-started/dashboard/configure-login-methods#oauth-login-methods). In Google Cloud Console, set the redirect URI to Privy’s callback: `https://auth.privy.io/api/v1/oauth/callback`.

Do not put secrets in frontend `.env` variables (anything prefixed with `VITE_` is bundled into the client build).
