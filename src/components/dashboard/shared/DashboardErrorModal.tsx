import { useEffect, type MouseEvent } from 'react'

const overlayClass =
  'fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5'

function useModalEscape(onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

export type DashboardErrorModalProps = {
  open: boolean
  title?: string
  message: string
  /** Label for the primary action button (when `onRetry` is provided). */
  retryLabel?: string
  primaryLabel?: string
  onClose: () => void
  onRetry?: () => void
}

function ErrorIcon() {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]"
      aria-hidden
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    </div>
  )
}

export default function DashboardErrorModal({
  open,
  title,
  message,
  retryLabel,
  primaryLabel,
  onClose,
  onRetry,
}: DashboardErrorModalProps) {
  const titleId = 'dashboard-error-title'
  const descId = 'dashboard-error-desc'

  useModalEscape(onClose, open)

  if (!open) return null

  const handleOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    onClose()
  }

  const safeMessage = message?.trim() ? message : 'Something went wrong.'

  return (
    <div
      className={overlayClass}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5 border-t-4 border-t-[#EF4444]">
        <div className="flex flex-col items-center text-center">
          <ErrorIcon />
          <h2 id={titleId} className="mt-5 text-lg font-semibold tracking-tight text-[#0B1220] sm:text-xl">
            {title?.trim() ? title : 'Unable to load dashboard'}
          </h2>
          <p id={descId} className="mt-2 text-sm leading-relaxed text-[#6B7280] whitespace-pre-wrap">
            {safeMessage}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-[48px] w-full rounded-xl text-[15px] font-semibold bg-[#1D61C1] text-white shadow-sm hover:bg-[#1955AD] active:scale-[0.99]"
            >
              {retryLabel?.trim() ? retryLabel : 'Retry'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] w-full rounded-xl text-[15px] font-semibold border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] active:scale-[0.99]"
          >
            {primaryLabel?.trim() ? primaryLabel : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  )
}

