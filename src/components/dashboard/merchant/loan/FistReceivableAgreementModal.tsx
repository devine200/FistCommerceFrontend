import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type UIEvent } from 'react'

import {
  FIST_RECEIVABLE_FINANCING_AGREEMENT_BLOCKS,
  FIST_RECEIVABLE_FINANCING_AGREEMENT_VERSION,
  type AgreementContentBlock,
} from '@/components/dashboard/merchant/loan/fistReceivableFinancingAgreement'

const SCROLL_END_THRESHOLD_PX = 28
const SCROLL_HINT =
  'Scroll to the end of the agreement to confirm that you have completed reading.'

export type FistReceivableAgreementModalProps = {
  open: boolean
  onClose: () => void
  onConfirmRead: () => void
}

function groupBulletRuns(blocks: readonly AgreementContentBlock[]) {
  const groups: Array<
    | { kind: 'single'; block: AgreementContentBlock; index: number }
    | { kind: 'bullets'; items: string[]; startIndex: number }
  > = []

  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]!
    if (block.type === 'bullet') {
      const items: string[] = []
      const startIndex = i
      while (i < blocks.length && blocks[i]!.type === 'bullet') {
        items.push((blocks[i] as Extract<AgreementContentBlock, { type: 'bullet' }>).text)
        i += 1
      }
      groups.push({ kind: 'bullets', items, startIndex })
      continue
    }
    groups.push({ kind: 'single', block, index: i })
    i += 1
  }
  return groups
}

function AgreementBody() {
  const groups = groupBulletRuns(FIST_RECEIVABLE_FINANCING_AGREEMENT_BLOCKS)

  return (
    <article className="mx-auto max-w-[640px]">
      <div className="rounded-[8px] border border-[#E6E8EC] bg-[#FCFCFD] px-4 py-5 sm:px-6 sm:py-6">
        {groups.map((group) => {
          if (group.kind === 'bullets') {
            return (
              <ul
                key={`bullets-${group.startIndex}`}
                className="mt-2 list-disc space-y-1.5 pl-5 text-[#334155] text-[13px] leading-relaxed"
              >
                {group.items.map((item, itemIndex) => (
                  <li key={`${group.startIndex}-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            )
          }

          const { block, index } = group
          switch (block.type) {
            case 'docTitle':
              return (
                <h3
                  key={index}
                  className="text-center text-[#0B1220] text-[15px] sm:text-[16px] font-bold tracking-wide"
                >
                  {block.text}
                </h3>
              )
            case 'meta':
              return (
                <div
                  key={index}
                  className={`${index === 1 ? 'mt-4' : 'mt-2'} flex flex-col gap-0.5 sm:flex-row sm:gap-2 text-[13px]`}
                >
                  <span className="shrink-0 font-semibold text-[#0B1220]">{block.label}:</span>
                  <span className="text-[#334155]">{block.text}</span>
                </div>
              )
            case 'party':
              return (
                <p
                  key={index}
                  className="mt-2 rounded-[6px] border border-[#E6E8EC] bg-white px-3 py-2 text-[#0B1220] text-[13px] leading-relaxed"
                >
                  {block.text}
                </p>
              )
            case 'sectionHeading':
              return (
                <h4
                  key={index}
                  className="mt-6 text-[#0B1220] text-[15px] font-semibold"
                >
                  {block.text}
                </h4>
              )
            case 'subheading':
              return (
                <p key={index} className="mt-3 text-[#0B1220] text-[13px] font-semibold">
                  {block.text}
                </p>
              )
            case 'paragraph':
              return (
                <p key={index} className="mt-2 text-[#334155] text-[13px] leading-relaxed">
                  {block.text}
                </p>
              )
            default:
              return null
          }
        })}
      </div>
    </article>
  )
}

export default function FistReceivableAgreementModal({
  open,
  onClose,
  onConfirmRead,
}: FistReceivableAgreementModalProps) {
  const titleId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const checkScrollPosition = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
    if (remaining <= SCROLL_END_THRESHOLD_PX) {
      setHasReachedEnd(true)
      setShowScrollHint(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setHasReachedEnd(false)
    setShowScrollHint(false)
    const frame = window.requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      checkScrollPosition()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, checkScrollPosition])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
    if (remaining <= SCROLL_END_THRESHOLD_PX) {
      setHasReachedEnd(true)
      setShowScrollHint(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-5"
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-[720px] max-h-[min(92vh,900px)] flex-col overflow-hidden rounded-[12px] border border-[#E6E8EC] bg-white shadow-xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E6E8EC] bg-[#F8FAFC] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[#6B7488] text-[11px] font-semibold uppercase tracking-wide">
              Document reader
            </p>
            <h2
              id={titleId}
              className="mt-1 text-[#0B1220] text-[16px] sm:text-[18px] font-bold leading-snug"
            >
              FIST RECEIVABLE FINANCING AGREEMENT
            </h2>
            <p className="mt-1 text-[#6B7488] text-[12px]">
              Agreement Version: {FIST_RECEIVABLE_FINANCING_AGREEMENT_VERSION}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-[#6B7488] hover:bg-[#EEF2F6] hover:text-[#0B1220]"
            aria-label="Close agreement"
          >
            <span className="text-[22px] leading-none" aria-hidden>
              ×
            </span>
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
        >
          <AgreementBody />
        </div>

        <footer className="shrink-0 border-t border-[#E6E8EC] bg-white px-4 py-3 sm:px-5 sm:py-4">
          {!hasReachedEnd ? (
            <p className="mb-2 text-center text-[#6B7488] text-[12px]">
              Scroll to the end to enable confirmation.
            </p>
          ) : null}
          <div
            className="relative"
            onMouseEnter={() => {
              if (!hasReachedEnd) setShowScrollHint(true)
            }}
            onMouseLeave={() => setShowScrollHint(false)}
            onFocusCapture={() => {
              if (!hasReachedEnd) setShowScrollHint(true)
            }}
            onBlurCapture={() => setShowScrollHint(false)}
          >
            {showScrollHint && !hasReachedEnd ? (
              <div
                role="tooltip"
                className="absolute bottom-full left-1/2 z-10 mb-2 w-[min(100%,320px)] -translate-x-1/2 rounded-[6px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-center text-[#92400E] text-[12px] leading-snug shadow-sm"
              >
                {SCROLL_HINT}
              </div>
            ) : null}
            <button
              type="button"
              disabled={!hasReachedEnd}
              title={!hasReachedEnd ? SCROLL_HINT : undefined}
              onClick={onConfirmRead}
              className={`w-full rounded-[6px] py-3 text-[15px] font-semibold transition-colors ${
                hasReachedEnd
                  ? 'bg-[#1B66CF] text-white hover:bg-[#154a9a]'
                  : 'cursor-not-allowed bg-[#D1D5DB] text-[#6B7280]'
              }`}
            >
              Confirm I have read
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
