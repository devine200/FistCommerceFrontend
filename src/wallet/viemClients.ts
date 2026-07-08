import type { ConnectedWallet } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient } from 'viem'

import { APP_CHAIN } from '@/wallet/appChain'
import { syncWalletChainIdFromProviderToRedux } from '@/wallet/syncWalletChainToRedux'
import {
  isChainAlreadyAddedError,
  isUserRejectedWalletRequest,
  shouldTryAddEthereumChain,
  WalletChainSwitchError,
} from '@/wallet/walletChainErrors'

export const DEFAULT_EVM_CHAIN = APP_CHAIN

type EthereumProvider = Awaited<ReturnType<ConnectedWallet['getEthereumProvider']>>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function getWalletClientFromPrivyWallet(wallet: ConnectedWallet): Promise<WalletClient> {
  const provider = await wallet.getEthereumProvider()
  return createWalletClient({
    chain: DEFAULT_EVM_CHAIN,
    transport: custom(provider),
    account: wallet.address as `0x${string}`,
  })
}

export function getPublicClient(): PublicClient {
  const rpcUrl = APP_CHAIN.rpcUrls.default.http[0]
  return createPublicClient({
    chain: DEFAULT_EVM_CHAIN,
    transport: http(rpcUrl),
  })
}

/** EIP-3085 params for `wallet_addEthereumChain`. */
function appChainAddEthereumChainParams(): {
  chainId: string
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
} {
  const rpcUrl = APP_CHAIN.rpcUrls.default.http[0]
  const explorer = APP_CHAIN.blockExplorers?.default?.url
  return {
    chainId: `0x${APP_CHAIN.id.toString(16)}`,
    chainName: APP_CHAIN.name,
    nativeCurrency: APP_CHAIN.nativeCurrency,
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

async function verifyProviderChain(provider: EthereumProvider, expectedChainId: number): Promise<void> {
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
        `Could not switch wallet to ${APP_CHAIN.name}.`,
        new Error(`chainId ${current ?? 'unknown'} !== ${expectedChainId}`),
      )
    }
  }
}

async function requestSwitchChain(provider: EthereumProvider, chainId: number): Promise<void> {
  const hex = `0x${chainId.toString(16)}`
  await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
}

async function requestAddAppChain(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [appChainAddEthereumChainParams()],
    })
  } catch (e) {
    if (isChainAlreadyAddedError(e)) return
    throw e
  }
}

async function switchWithOptionalAdd(provider: EthereumProvider, chainId: number): Promise<void> {
  const hex = `0x${chainId.toString(16)}`
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
  } catch (e) {
    if (isUserRejectedWalletRequest(e)) {
      throw new WalletChainSwitchError(
        `Network switch to ${APP_CHAIN.name} was cancelled. Approve the prompt in your wallet app.`,
        e,
        true,
      )
    }
    if (chainId === APP_CHAIN.id && shouldTryAddEthereumChain(e)) {
      try {
        await requestAddAppChain(provider)
        await requestSwitchChain(provider, chainId)
      } catch (addOrSwitchErr) {
        if (isUserRejectedWalletRequest(addOrSwitchErr)) {
          throw new WalletChainSwitchError(
            `Network switch to ${APP_CHAIN.name} was cancelled. Approve the prompt in your wallet app.`,
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

  await switchWithOptionalAdd(provider, chainId)

  try {
    await verifyProviderChain(provider, chainId)
  } catch (verifyErr) {
    // Some mobile wallets report switch success but stay on the old chain — retry add + switch once.
    if (chainId === APP_CHAIN.id) {
      try {
        await requestAddAppChain(provider)
        await requestSwitchChain(provider, chainId)
        await verifyProviderChain(provider, chainId)
      } catch (retryErr) {
        if (isUserRejectedWalletRequest(retryErr)) {
          throw new WalletChainSwitchError(
            `Network switch to ${APP_CHAIN.name} was cancelled. Approve the prompt in your wallet app.`,
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
