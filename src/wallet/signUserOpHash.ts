import type { Address, Hex, WalletClient } from 'viem'
import { hexToBytes, toHex } from 'viem'

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

const SECP256K1_N = BigInt(
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
)
const SECP256K1_HALF_N = SECP256K1_N / 2n

function pad32(value: bigint): Hex {
  return toHex(value, { size: 32 })
}

/**
 * Normalize 65-byte ECDSA for OpenZeppelin ECDSA.tryRecover (low-s, v∈{27,28}).
 * Prevents AA24 when wallets return high-s / v=0|1 signatures that eth_account still recovers.
 */
export function normalizeSecp256k1Signature(signature: Hex): Hex {
  const raw = hexToBytes(signature)
  if (raw.length !== 65) return signature
  let r = BigInt(toHex(raw.slice(0, 32)))
  let s = BigInt(toHex(raw.slice(32, 64)))
  let v = raw[64]!
  if (v === 0 || v === 1) v += 27
  if (s > SECP256K1_HALF_N) {
    s = SECP256K1_N - s
    v = v === 27 ? 28 : 27
  }
  if (v !== 27 && v !== 28) {
    throw new Error(`Unsupported ECDSA v value: ${v}`)
  }
  const out = new Uint8Array(65)
  out.set(hexToBytes(pad32(r)), 0)
  out.set(hexToBytes(pad32(s)), 32)
  out[64] = v
  return toHex(out)
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
    const signature = await walletClient.signTypedData({
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
    return normalizeSecp256k1Signature(signature)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Wallet could not EIP-712-sign the UserOp approval (signTypedData). ${msg}`,
    )
  }
}
