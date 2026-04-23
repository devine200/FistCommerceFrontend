import type { ConnectedWallet } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient } from 'viem'
import { sepolia } from 'viem/chains'

export const DEFAULT_EVM_CHAIN = sepolia

export async function getWalletClientFromPrivyWallet(wallet: ConnectedWallet): Promise<WalletClient> {
  const provider = await wallet.getEthereumProvider()
  return createWalletClient({
    chain: DEFAULT_EVM_CHAIN,
    transport: custom(provider),
    account: wallet.address as `0x${string}`,
  })
}

export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: DEFAULT_EVM_CHAIN,
    transport: http(),
  })
}

export async function ensureWalletChain(wallet: ConnectedWallet, chainId: number): Promise<void> {
  const provider = await wallet.getEthereumProvider()
  const hex = `0x${chainId.toString(16)}`
  await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
}

