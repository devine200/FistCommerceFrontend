import type { ConnectedWallet } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient } from 'viem'
import { sepolia } from 'viem/chains'

import { syncWalletChainIdFromProviderToRedux } from '@/wallet/syncWalletChainToRedux'

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

function eip1193ErrorCode(e: unknown): number | undefined {
  if (e && typeof e === 'object' && 'code' in e) {
    const c = (e as { code?: unknown }).code
    if (typeof c === 'number') return c
  }
  return undefined
}

/** EIP-3085 params for `wallet_addEthereumChain` (Sepolia only — app testnet). */
function sepoliaAddEthereumChainParams(): {
  chainId: string
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
} {
  const rpcUrl = sepolia.rpcUrls.default.http[0]
  const explorer = sepolia.blockExplorers?.default?.url
  return {
    chainId: `0x${sepolia.id.toString(16)}`,
    chainName: sepolia.name,
    nativeCurrency: sepolia.nativeCurrency,
    rpcUrls: [rpcUrl],
    ...(explorer ? { blockExplorerUrls: [explorer] } : {}),
  }
}

async function verifyProviderChain(
  provider: Awaited<ReturnType<ConnectedWallet['getEthereumProvider']>>,
  expectedChainId: number,
): Promise<void> {
  const raw = await provider.request({ method: 'eth_chainId' })
  const current =
    typeof raw === 'string' && raw.startsWith('0x') ? Number.parseInt(raw, 16) : Number(raw)
  if (!Number.isFinite(current) || current !== expectedChainId) {
    if (import.meta.env.DEV) {
      console.warn('[ensureWalletChain] eth_chainId after switch does not match target', {
        expectedChainId,
        current,
        raw,
      })
    }
    throw new Error(`Could not switch wallet to chain ${expectedChainId}.`)
  }
}

export async function ensureWalletChain(wallet: ConnectedWallet, chainId: number): Promise<void> {
  const provider = await wallet.getEthereumProvider()
  const hex = `0x${chainId.toString(16)}`
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
  } catch (e) {
    if (eip1193ErrorCode(e) === 4902 && chainId === sepolia.id) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [sepoliaAddEthereumChainParams()],
      })
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
    } else {
      throw e
    }
  }
  await verifyProviderChain(provider, chainId)
  try {
    await syncWalletChainIdFromProviderToRedux(wallet, Boolean(wallet.address), wallet.address ?? null)
  } catch {
    /* Redux mirror is best-effort; chain switch already succeeded. */
  }
}

