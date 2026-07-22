import type { ConnectedWallet } from '@privy-io/react-auth'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
} from 'viem'

import {
  APP_CHAIN,
  DEFAULT_APP_CHAIN,
  getAppChainById,
  isSupportedAppChainId,
} from '@/wallet/appChain'
import { syncWalletChainIdFromProviderToRedux } from '@/wallet/syncWalletChainToRedux'
import {
  isChainAlreadyAddedError,
  isUserRejectedWalletRequest,
  shouldTryAddEthereumChain,
  WalletChainSwitchError,
} from '@/wallet/walletChainErrors'

/** @deprecated Prefer `DEFAULT_APP_CHAIN` or `getAppChainById`. */
export const DEFAULT_EVM_CHAIN = APP_CHAIN

type EthereumProvider = Awaited<ReturnType<ConnectedWallet['getEthereumProvider']>>

const publicClientByChainId = new Map<number, PublicClient>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function resolveChain(chainId?: number | null): Chain {
  return getAppChainById(chainId) ?? DEFAULT_APP_CHAIN
}

export async function getWalletClientFromPrivyWallet(
  wallet: ConnectedWallet,
  chainId?: number | null,
): Promise<WalletClient> {
  const provider = await wallet.getEthereumProvider()
  const chain = resolveChain(chainId)
  return createWalletClient({
    chain,
    transport: custom(provider),
    account: wallet.address as `0x${string}`,
  })
}

export function getPublicClient(chainId?: number | null): PublicClient {
  const chain = resolveChain(chainId)
  const cached = publicClientByChainId.get(chain.id)
  if (cached) return cached
  const rpcUrl = chain.rpcUrls.default.http[0]
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  })
  publicClientByChainId.set(chain.id, client)
  return client
}

function addEthereumChainParams(chain: Chain): {
  chainId: string
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
} {
  const rpcUrl = chain.rpcUrls.default.http[0]
  const explorer = chain.blockExplorers?.default?.url
  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [rpcUrl],
    ...(explorer ? { blockExplorerUrls: [explorer] } : {}),
  }
}

async function readProviderChainId(provider: EthereumProvider): Promise<number | undefined> {
  const raw = await provider.request({ method: 'eth_chainId' })
  const current =
    typeof raw === 'string' && raw.startsWith('0x') ? Number.parseInt(raw, 16) : Number(raw)
  return Number.isFinite(current) ? current : undefined
}

async function verifyProviderChain(
  provider: EthereumProvider,
  expectedChainId: number,
  chainName: string,
): Promise<void> {
  const delaysMs = [0, 250, 500, 900]
  for (let i = 0; i < delaysMs.length; i++) {
    if (delaysMs[i] > 0) await sleep(delaysMs[i])
    const current = await readProviderChainId(provider)
    if (current === expectedChainId) return
    if (i === delaysMs.length - 1) {
      if (import.meta.env.DEV) {
        console.warn('[ensureWalletChain] eth_chainId after switch does not match target', {
          expectedChainId,
          current,
        })
      }
      throw new WalletChainSwitchError(
        `Could not switch wallet to ${chainName}.`,
        new Error(`chainId ${current ?? 'unknown'} !== ${expectedChainId}`),
      )
    }
  }
}

async function requestSwitchChain(provider: EthereumProvider, chainId: number): Promise<void> {
  const hex = `0x${chainId.toString(16)}`
  await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
}

async function requestAddChain(provider: EthereumProvider, chain: Chain): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [addEthereumChainParams(chain)],
    })
  } catch (e) {
    if (isChainAlreadyAddedError(e)) return
    throw e
  }
}

async function switchWithOptionalAdd(
  provider: EthereumProvider,
  chain: Chain,
): Promise<void> {
  const chainId = chain.id
  const hex = `0x${chainId.toString(16)}`
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
  } catch (e) {
    if (isUserRejectedWalletRequest(e)) {
      throw new WalletChainSwitchError(
        `Network switch to ${chain.name} was cancelled. Approve the prompt in your wallet app.`,
        e,
        true,
      )
    }
    if (isSupportedAppChainId(chainId) && shouldTryAddEthereumChain(e)) {
      try {
        await requestAddChain(provider, chain)
        await requestSwitchChain(provider, chainId)
      } catch (addOrSwitchErr) {
        if (isUserRejectedWalletRequest(addOrSwitchErr)) {
          throw new WalletChainSwitchError(
            `Network switch to ${chain.name} was cancelled. Approve the prompt in your wallet app.`,
            addOrSwitchErr,
            true,
          )
        }
        throw addOrSwitchErr
      }
      return
    }
    throw e
  }
}

export async function ensureWalletChain(wallet: ConnectedWallet, chainId: number): Promise<void> {
  const chain = getAppChainById(chainId)
  if (!chain) {
    throw new WalletChainSwitchError(`Unsupported chain id ${chainId}.`, new Error('unsupported_chain'))
  }

  const provider = await wallet.getEthereumProvider()

  const current = await readProviderChainId(provider)
  if (current === chainId) {
    try {
      await syncWalletChainIdFromProviderToRedux(wallet, Boolean(wallet.address), wallet.address ?? null)
    } catch {
      /* Redux mirror is best-effort. */
    }
    return
  }

  await switchWithOptionalAdd(provider, chain)

  try {
    await verifyProviderChain(provider, chainId, chain.name)
  } catch (verifyErr) {
    if (isSupportedAppChainId(chainId)) {
      try {
        await requestAddChain(provider, chain)
        await requestSwitchChain(provider, chainId)
        await verifyProviderChain(provider, chainId, chain.name)
      } catch (retryErr) {
        if (isUserRejectedWalletRequest(retryErr)) {
          throw new WalletChainSwitchError(
            `Network switch to ${chain.name} was cancelled. Approve the prompt in your wallet app.`,
            retryErr,
            true,
          )
        }
        throw verifyErr instanceof WalletChainSwitchError ? verifyErr : retryErr
      }
    } else {
      throw verifyErr
    }
  }

  try {
    await syncWalletChainIdFromProviderToRedux(wallet, Boolean(wallet.address), wallet.address ?? null)
  } catch {
    /* Redux mirror is best-effort; chain switch already succeeded. */
  }
}

/** Read the provider chain id without trusting Redux. */
export async function readWalletProviderChainId(
  wallet: ConnectedWallet,
): Promise<number | undefined> {
  const provider = await wallet.getEthereumProvider()
  return readProviderChainId(provider)
}
