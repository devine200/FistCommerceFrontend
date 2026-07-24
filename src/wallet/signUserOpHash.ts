import type { Address, Hex, WalletClient } from 'viem'

export type UserOpApprovalTypedData = {
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: Address
  }
  types: {
    UserOpApproval: readonly { name: string; type: string }[]
  }
  primaryType: 'UserOpApproval'
  message: {
    userOpHash: Hex
  }
}

/**
 * EIP-712 signTypedData for FistMultisigAccount UserOpApproval(userOpHash).
 * Wallet-friendly (Privy / MetaMask / mobile) — not eth_sign / personal_sign.
 */
export async function signUserOpHashTypedData(
  walletClient: WalletClient,
  account: Address,
  typedData: UserOpApprovalTypedData,
): Promise<Hex> {
  try {
    return await walletClient.signTypedData({
      account,
      domain: {
        name: typedData.domain.name,
        version: typedData.domain.version,
        chainId: typedData.domain.chainId,
        verifyingContract: typedData.domain.verifyingContract,
      },
      types: {
        UserOpApproval: [...typedData.types.UserOpApproval],
      },
      primaryType: 'UserOpApproval',
      message: {
        userOpHash: typedData.message.userOpHash,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Wallet could not EIP-712-sign the UserOp approval (signTypedData). ${msg}`,
    )
  }
}
