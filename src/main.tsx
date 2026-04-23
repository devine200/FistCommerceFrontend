import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import App from './App.tsx'
import WalletReduxSync from '@/components/session/WalletReduxSync'
import AuthStorageSync from '@/store/AuthStorageSync'
import FullPageLoading from '@/components/app/FullPageLoading'
import { persistor, store } from '@/store'

import '@fontsource/outfit';
import './index.css'

const queryClient = new QueryClient()
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID
/** Same value you paste into Privy → Login methods → Google (custom credentials). Public only. */
const googleOauthClientIdForDocs =
  import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID?.trim() || import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

if (import.meta.env.DEV && !googleOauthClientIdForDocs) {
  console.info(
    '[Privy] Set VITE_GOOGLE_OAUTH_CLIENT_ID in .env to match the Google Web Client ID you configure in the Privy dashboard. The React SDK does not load OAuth secrets from the frontend.',
  )
}

const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'google', 'wallet'],
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  externalWallets: {
    walletConnect: { enabled: true },
    // coinbaseWallet: { config: { /* optional overrides */ } },
  },
  appearance: {
    // Ensure the Privy modal surfaces the wallets you want users to connect.
    walletList: [
      'metamask',
      'phantom',
      'coinbase_wallet',
      'wallet_connect',
      'detected_ethereum_wallets',
    ],
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<FullPageLoading label="Restoring your session…" />} persistor={persistor}>
        <AuthStorageSync />
        <PrivyProvider appId={privyAppId ?? ''} config={privyConfig}>
          <QueryClientProvider client={queryClient}>
            <WalletReduxSync />
            <App />
          </QueryClientProvider>
        </PrivyProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
