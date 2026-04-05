import { useEffect, type MouseEvent } from 'react'

const overlayClass =
  'fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-5'

function useModalEscape(onAction: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAction()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onAction])
}

export type AdminLoginFeedbackModalProps = {
  open: boolean
  variant: 'error' | 'success'
  title: string
  description: string
  primaryLabel: string
  /** Error: dismiss modal. Success: complete sign-in and navigate. */
  onPrimary: () => void
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

function SuccessIcon() {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]"
      aria-hidden
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>
  )
}

export function AdminLoginFeedbackModal({
  open,
  variant,
  title,
  description,
  primaryLabel,
  onPrimary,
}: AdminLoginFeedbackModalProps) {
  const titleId = 'admin-login-feedback-title'
  const descId = 'admin-login-feedback-desc'

  useModalEscape(onPrimary, open)

  if (!open) return null

  const handleOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (variant === 'error') onPrimary()
  }

  return (
    <div
      className={overlayClass}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div
        className={[
          'w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5 sm:p-9',
          variant === 'error' ? 'border-t-4 border-t-[#EF4444]' : 'border-t-4 border-t-[#22C55E]',
        ].join(' ')}
      >
        <div className="flex flex-col items-center text-center">
          {variant === 'error' ? <ErrorIcon /> : <SuccessIcon />}
          <h2 id={titleId} className="mt-5 text-lg font-semibold tracking-tight text-[#0B1220] sm:text-xl">
            {title}
          </h2>
          <p id={descId} className="mt-2 text-sm leading-relaxed text-[#6B7280]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onPrimary}
          className={[
            'mt-8 min-h-[48px] w-full rounded-xl text-[15px] font-semibold transition-[background-color,transform] active:scale-[0.99]',
            variant === 'error'
              ? 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
              : 'bg-[#1D61C1] text-white shadow-sm hover:bg-[#1955AD]',
          ].join(' ')}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
