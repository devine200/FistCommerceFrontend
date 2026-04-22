import { injected, walletConnect } from '@wagmi/connectors'
import { createConfig, http } from 'wagmi'
import { arbitrum, mainnet, sepolia } from 'wagmi/chains'

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const appOrigin =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

const connectors = [
  injected({ target: 'metaMask' }),
  injected({ target: 'phantom' }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            name: 'FistCommerce',
            description: 'FistCommerce platform',
            url: appOrigin,
            icons: [],
          },
          showQrModal: true,
        }),
      ]
    : []),
]

export const config = createConfig({
  chains: [arbitrum, mainnet, sepolia],
  connectors,
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
