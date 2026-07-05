import type { ReactNode } from 'react'

import { blockExplorerAddressUrl } from '@/api/payout'
import type { MultisigProposalCall, OperationType } from '@/api/types/multisig'
import { shortAddress } from '@/components/admin/settings/SettingsPanel'

const SIGNER_MGMT_TYPES: OperationType[] = [
  'multisig_add_signers',
  'multisig_remove_signers',
  'multisig_set_threshold',
  'multisig_signer_rotation',
]

export function isSignerMgmtOperationType(type: OperationType): boolean {
  return SIGNER_MGMT_TYPES.includes(type)
}

function pickAddressList(args: Record<string, unknown>): string[] {
  const raw = args.addresses ?? args.add_addresses ?? args.addAddresses ?? args.remove_addresses ?? args.removeAddresses
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function pickThreshold(args: Record<string, unknown>): number | null {
  const raw = args.threshold
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number(raw)
    if (Number.isFinite(n)) return n
  }
  return null
}

function AddressList({
  addresses,
  explorerBase,
}: {
  addresses: string[]
  explorerBase: string | null
}) {
  if (!addresses.length) return <span className="text-[#6B7488]">—</span>
  return (
    <ul className="mt-1 space-y-1">
      {addresses.map((addr) => {
        const href = explorerBase ? blockExplorerAddressUrl(explorerBase, addr) : null
        return (
          <li key={addr} className="font-mono text-[13px]">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#195EBC] hover:underline">
                {shortAddress(addr)}
              </a>
            ) : (
              shortAddress(addr)
            )}
          </li>
        )
      })}
    </ul>
  )
}

function formatCallDecodedArgs(
  call: MultisigProposalCall,
  explorerBase: string | null,
  signerCount: number | undefined,
): ReactNode | null {
  const args = call.decodedArgs
  if (!args || !Object.keys(args).length) return null

  const fn = (call.function ?? '').toLowerCase()
  const addresses = pickAddressList(args)
  const threshold = pickThreshold(args)

  if (fn.includes('addsigner') || fn.includes('add_signer')) {
    return (
      <div>
        <p className="text-[#6B7488] text-[12px] font-medium">Add owners</p>
        <AddressList addresses={addresses} explorerBase={explorerBase} />
      </div>
    )
  }

  if (fn.includes('removesigner') || fn.includes('remove_signer')) {
    return (
      <div>
        <p className="text-[#6B7488] text-[12px] font-medium">Remove owners</p>
        <AddressList addresses={addresses} explorerBase={explorerBase} />
      </div>
    )
  }

  if (fn.includes('threshold') || fn.includes('setthreshold')) {
    if (threshold == null) return null
    const count = signerCount ?? addresses.length
    return (
      <p className="text-[#0B1220] text-[13px]">
        Requires <span className="font-semibold">{threshold}</span>
        {count > 0 ? (
          <>
            {' '}
            of <span className="font-semibold">{count}</span> signatures
          </>
        ) : (
          ' signatures'
        )}
      </p>
    )
  }

  if (addresses.length) {
    return (
      <div>
        <p className="text-[#6B7488] text-[12px] font-medium">Addresses</p>
        <AddressList addresses={addresses} explorerBase={explorerBase} />
      </div>
    )
  }

  if (threshold != null) {
    return (
      <p className="text-[#0B1220] text-[13px]">
        Threshold: <span className="font-semibold">{threshold}</span>
      </p>
    )
  }

  return null
}

export function formatSignerMgmtCallContent(
  call: MultisigProposalCall,
  options: { explorerBase: string | null; signerCount?: number },
): ReactNode | null {
  return formatCallDecodedArgs(call, options.explorerBase, options.signerCount)
}

export function formatSignerMgmtDecodedArgs(
  operationType: OperationType,
  decodedArgs: Record<string, unknown> | undefined,
  options: { explorerBase: string | null; signerCount?: number },
): ReactNode | null {
  if (!decodedArgs || !Object.keys(decodedArgs).length) return null
  if (!isSignerMgmtOperationType(operationType)) return null

  const addresses = pickAddressList(decodedArgs)
  const threshold = pickThreshold(decodedArgs)
  const count = options.signerCount

  if (operationType === 'multisig_add_signers') {
    return (
      <div>
        <p className="text-[#6B7488] text-[12px] font-medium">Add owners</p>
        <AddressList addresses={addresses} explorerBase={options.explorerBase} />
      </div>
    )
  }

  if (operationType === 'multisig_remove_signers') {
    return (
      <div>
        <p className="text-[#6B7488] text-[12px] font-medium">Remove owners</p>
        <AddressList addresses={addresses} explorerBase={options.explorerBase} />
      </div>
    )
  }

  if (operationType === 'multisig_set_threshold' && threshold != null) {
    return (
      <p className="text-[#0B1220] text-[13px]">
        Requires <span className="font-semibold">{threshold}</span>
        {count != null ? (
          <>
            {' '}
            of <span className="font-semibold">{count}</span> signatures
          </>
        ) : (
          ' signatures'
        )}
      </p>
    )
  }

  if (operationType === 'multisig_signer_rotation') {
    const addAddresses = Array.isArray(decodedArgs.add_addresses)
      ? (decodedArgs.add_addresses as string[])
      : Array.isArray(decodedArgs.addAddresses)
        ? (decodedArgs.addAddresses as string[])
        : []
    const removeAddresses = Array.isArray(decodedArgs.remove_addresses)
      ? (decodedArgs.remove_addresses as string[])
      : Array.isArray(decodedArgs.removeAddresses)
        ? (decodedArgs.removeAddresses as string[])
        : []

    return (
      <div className="space-y-3">
        {addAddresses.length ? (
          <div>
            <p className="text-[#6B7488] text-[12px] font-medium">Add owners</p>
            <AddressList addresses={addAddresses} explorerBase={options.explorerBase} />
          </div>
        ) : null}
        {removeAddresses.length ? (
          <div>
            <p className="text-[#6B7488] text-[12px] font-medium">Remove owners</p>
            <AddressList addresses={removeAddresses} explorerBase={options.explorerBase} />
          </div>
        ) : null}
        {threshold != null ? (
          <p className="text-[#0B1220] text-[13px]">
            New threshold: <span className="font-semibold">{threshold}</span>
          </p>
        ) : null}
      </div>
    )
  }

  return null
}
