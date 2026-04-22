type FormSubmitLoadingNoticeProps = {
  show: boolean
  /** Shown next to the spinner (also used by screen readers via the live region). */
  message?: string
  className?: string
}

/**
 * Inline status when an onboarding (or other) form is waiting on the API.
 * Use with `aria-busy` on the parent `<form>` and disabled controls while `show` is true.
 */
export default function FormSubmitLoadingNotice({
  show,
  message = 'Saving your information…',
  className = '',
}: FormSubmitLoadingNoticeProps) {
  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex items-center gap-3 rounded-md border border-[#CFE0FF] bg-[#F3F7FF] px-4 py-3 text-[#195EBC] ${className}`.trim()}
    >
      <span
        className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#195EBC] border-t-transparent"
        aria-hidden
      />
      <span className="text-[14px] font-medium">{message}</span>
    </div>
  )
}
