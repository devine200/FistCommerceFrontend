import type { Address, Hex, WalletClient } from 'viem'

/**
 * Raw ECDSA over a 32-byte hash (EntryPoint userOpHash).
 * Must NOT use personal_sign / EIP-191 — on-chain validation uses ECDSA.tryRecover(hash, sig).
 */
export async function signUserOpHashRaw(
  walletClient: WalletClient,
  account: Address,
  userOpHash: Hex,
): Promise<Hex> {
  const hash = (userOpHash.startsWith('0x') ? userOpHash : `0x${userOpHash}`) as Hex

  const localSign = walletClient.account && 'sign' in walletClient.account
    ? (walletClient.account as { sign?: (args: { hash: Hex }) => Promise<Hex> }).sign
    : undefined
  if (typeof localSign === 'function') {
    return localSign.call(walletClient.account, { hash })
  }

  try {
    return (await walletClient.request({
      method: 'eth_sign',
      params: [account, hash],
    })) as Hex
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Wallet could not raw-sign the UserOp hash (eth_sign). ` +
        `Multisig execute requires a raw ECDSA signature, not personal_sign. ${msg}`,
    )
  }
}
