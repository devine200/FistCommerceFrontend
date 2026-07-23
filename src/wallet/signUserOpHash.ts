import type { Address, Hex, WalletClient } from 'viem'

/**
 * Raw ECDSA over a 32-byte EntryPoint userOpHash (no EIP-191 personal_sign).
 * Required by the deployed FistMultisigAccount (ECDSA.tryRecover on the bare hash).
 */
export async function signUserOpHashRaw(
  walletClient: WalletClient,
  account: Address,
  userOpHash: Hex,
): Promise<Hex> {
  const hash = (userOpHash.startsWith('0x') ? userOpHash : `0x${userOpHash}`) as Hex

  const localSign =
    walletClient.account && 'sign' in walletClient.account
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
      `Wallet could not raw-sign the UserOp hash (eth_sign / account.sign). ` +
        `The deployed multisig requires a raw ECDSA signature, not personal_sign. ${msg}`,
    )
  }
}
