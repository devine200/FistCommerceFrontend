import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { WagmiProvider } from 'wagmi'

import App from './App.tsx'
import WalletReduxSync from '@/components/session/WalletReduxSync'
import AuthStorageSync from '@/store/AuthStorageSync'
import FullPageLoading from '@/components/app/FullPageLoading'
import { persistor, store } from '@/store'
import { config } from './wagmi.ts'

import '@fontsource/outfit';
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<FullPageLoading label="Restoring your session…" />} persistor={persistor}>
        <AuthStorageSync />
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <WalletReduxSync />
            <App />
          </QueryClientProvider>
        </WagmiProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
