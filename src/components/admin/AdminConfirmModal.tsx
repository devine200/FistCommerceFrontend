import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'

/** Above AdminActionFeedbackModal (z-70) so confirm never sits under loading. */
const overlayClass =
  'fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5'

export type AdminConfirmModalVariant = 'default' | 'warning' | 'destructive'

export type AdminConfirmModalProps = {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: AdminConfirmModalVariant
  confirmDisabled?: boolean
  confirmLoading?: boolean
  dismissible?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function variantBorderClass(variant: AdminConfirmModalVariant): string {
  if (variant === 'destructive') return 'border-t-4 border-t-[#EF4444]'
  if (variant === 'warning') return 'border-t-4 border-t-[#D97706]'
  return 'border-t-4 border-t-[#195EBC]'
}

function WarningIcon() {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]"
      aria-hidden
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    </div>
  )
}

export default function AdminConfirmModal({
  open,
  title,
  description,
  children,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  variant = 'default',
  confirmDisabled = false,
  confirmLoading = false,
  dismissible = true,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  const titleId = useId()
  const descId = useId()
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => confirmRef.current?.focus(), 0)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = prevOverflow
      previousFocusRef.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open || !dismissible || confirmLoading) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismissible, confirmLoading, onCancel])

  if (!open) return null

  const handleOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!dismissible || confirmLoading) return
    if (e.target !== e.currentTarget) return
    onCancel()
  }

  const primaryClass =
    variant === 'destructive'
      ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
      : variant === 'warning'
        ? 'bg-[#D97706] hover:bg-[#B45309]'
        : 'bg-[#1D61C1] hover:bg-[#1955AD]'

  return (
    <div
      className={overlayClass}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description || children ? descId : undefined}
    >
      <div
        className={[
          'flex max-h-[min(90vh,640px)] w-full max-w-[480px] flex-col rounded-2xl bg-white shadow-xl ring-1 ring-black/5',
          variantBorderClass(variant),
        ].join(' ')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto px-8 pb-4 pt-8 sm:px-9">
          <div className="flex flex-col items-center text-center">
            {variant === 'warning' ? <WarningIcon /> : null}
            <h2 id={titleId} className="mt-4 text-lg font-semibold tracking-tight text-[#0B1220] sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-2 text-sm leading-relaxed text-[#6B7280] whitespace-pre-line">
                {description}
              </p>
            ) : null}
            {children ? (
              <div id={description ? undefined : descId} className="mt-4 w-full text-left text-sm text-[#374151]">
                {children}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 border-t border-[#E5E7EB] px-8 py-5 sm:px-9">
          <button
            ref={confirmRef}
            type="button"
            disabled={confirmDisabled || confirmLoading}
            onClick={onConfirm}
            className={[
              'min-h-[48px] w-full rounded-xl text-[15px] font-semibold text-white shadow-sm transition-[background-color,transform] active:scale-[0.99] disabled:opacity-50',
              primaryClass,
            ].join(' ')}
          >
            {confirmLoading ? 'Please wait…' : confirmLabel}
          </button>
          <button
            type="button"
            disabled={confirmLoading}
            onClick={onCancel}
            className="min-h-[48px] w-full rounded-xl border border-[#E5E7EB] bg-white text-[15px] font-semibold text-[#374151] transition-[background-color,transform] hover:bg-[#F9FAFB] active:scale-[0.99] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
