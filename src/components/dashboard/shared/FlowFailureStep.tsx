interface FlowFailureStepProps {
  title?: string
  /** User-facing explanation (plain language, no stack traces). */
  message: string
  primaryLabel?: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

/**
 * Full-width outcome screen for invest/withdraw flows (mirrors success step layout).
 */
export default function FlowFailureStep({
  title = "We couldn't complete that",
  message,
  primaryLabel = 'Try again',
  onPrimary,
  secondaryLabel,
  onSecondary,
}: FlowFailureStepProps) {
  return (
    <>
      <section className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center">
        <div
          className="h-16 w-16 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-[32px] font-bold"
          aria-hidden
        >
          !
        </div>
        <h2 className="mt-4 text-[#991B1B] font-bold text-[28px] sm:text-[34px] leading-tight">{title}</h2>
        <p className="mt-3 max-w-[560px] text-[#7F1D1D] text-[15px] leading-relaxed">{message}</p>
      </section>

      <section className="rounded-[8px] border border-[#E6E8EC] bg-white p-3">
        <div
          className={
            secondaryLabel && onSecondary
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
              : 'flex flex-col gap-3'
          }
        >
          <button
            type="button"
            onClick={onPrimary}
            className="h-[46px] w-full rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors"
          >
            {primaryLabel}
          </button>
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="h-[46px] w-full rounded-[4px] bg-[#EEF2F6] text-[#195EBC] text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#E5ECF4] transition-colors"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </section>
    </>
  )
}
