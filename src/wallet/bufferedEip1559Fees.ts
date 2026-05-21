import type { PublicClient } from 'viem'

/** Multiplier for a 15% buffer on EIP-1559 fee fields (115 / 100). */
const GAS_FEE_BUFFER_NUMERATOR = 115n
const GAS_FEE_BUFFER_DENOMINATOR = 100n

function withGasBuffer(value: bigint): bigint {
  return (value * GAS_FEE_BUFFER_NUMERATOR) / GAS_FEE_BUFFER_DENOMINATOR
}

export type BufferedEip1559Fees = {
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

/** Fresh network estimate with a 15% buffer to reduce base-fee race rejections. */
export async function getBufferedEip1559Fees(publicClient: PublicClient): Promise<BufferedEip1559Fees> {
  const fees = await publicClient.estimateFeesPerGas()
  const out: BufferedEip1559Fees = {}
  if (fees.maxFeePerGas != null) out.maxFeePerGas = withGasBuffer(fees.maxFeePerGas)
  if (fees.maxPriorityFeePerGas != null) {
    out.maxPriorityFeePerGas = withGasBuffer(fees.maxPriorityFeePerGas)
  }
  return out
}
