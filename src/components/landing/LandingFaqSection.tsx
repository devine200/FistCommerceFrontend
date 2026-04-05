import { useState } from 'react'

import type { LandingFaqItem } from '@/components/landing/types'

export type LandingFaqSectionProps = {
  sectionId?: string
  heading?: string
  items: LandingFaqItem[]
  defaultOpenIndex?: number
}

export function LandingFaqSection({
  sectionId = 'faq',
  heading = 'FAQs',
  items,
  defaultOpenIndex = 0,
}: LandingFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex)

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 flex min-h-[900px] flex-col justify-center border-t border-slate-100 py-16 sm:py-20"
    >
      <div className="mx-auto w-[90%]">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">{heading}</h2>
        <div className="mt-12 space-y-4 sm:mt-14">
          {items.map((f, i) => (
            <div key={f.id} className="rounded-2xl border border-slate-200 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-slate-900 sm:py-6 sm:text-lg"
              >
                {f.question}
                <span className="shrink-0 text-xl text-slate-400" aria-hidden>
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <p className="border-t border-slate-200 px-6 pb-5 pt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                  {f.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
