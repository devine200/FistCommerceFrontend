import type { MerchantReceivablesStatus } from '@/store/slices/merchantReceivablesSlice'

export type AsyncTableBodyVariant = 'loading' | 'error' | 'empty'

export type AsyncTableBodyState =
  | { kind: 'message'; message: string; variant: AsyncTableBodyVariant }
  | { kind: 'rows' }

export function resolveAsyncTableBodyState(
  status: MerchantReceivablesStatus,
  error: string | null | undefined,
  options: {
    hasRows: boolean
    loadingMessage: string
    emptyMessage: string
  },
): AsyncTableBodyState {
  if (status === 'loading') {
    return { kind: 'message', message: options.loadingMessage, variant: 'loading' }
  }
  const errorMessage = status === 'failed' ? error?.trim() : ''
  if (errorMessage) {
    return { kind: 'message', message: errorMessage, variant: 'error' }
  }
  if (status === 'succeeded' && !options.hasRows) {
    return { kind: 'message', message: options.emptyMessage, variant: 'empty' }
  }
  return { kind: 'rows' }
}

export function AsyncTableBodyMessage({
  message,
  variant,
  layout,
  colSpan,
  desktopCellClassName = 'px-5 py-12',
  mobileClassName = 'px-4 sm:px-6 py-10',
}: {
  message: string
  variant: AsyncTableBodyVariant
  layout: 'mobile' | 'mobile-block' | 'desktop'
  colSpan: number
  desktopCellClassName?: string
  mobileClassName?: string
}) {
  const textColor = variant === 'error' ? 'text-[#B91C1C]' : 'text-[#8B92A3]'
  const textSize = layout === 'desktop' ? 'text-[14px]' : 'text-[13px]'
  const role = variant === 'error' ? 'alert' : 'status'

  if (layout === 'mobile' || layout === 'mobile-block') {
    const className = `text-center ${mobileClassName} ${textColor} ${textSize}`
    if (layout === 'mobile-block') {
      return (
        <div className={className} role={role}>
          {message}
        </div>
      )
    }
    return (
      <li className={className} role={role}>
        {message}
      </li>
    )
  }

  return (
    <tr className="border-b border-[#EDF0F4] bg-white">
      <td colSpan={colSpan} className={`text-center ${desktopCellClassName} ${textColor} ${textSize}`} role={role}>
        {message}
      </td>
    </tr>
  )
}
