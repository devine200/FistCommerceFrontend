import type { LandingLendingPoolSectionProps } from '@/components/landing/types'

export function LandingLendingPoolSection({
  sectionId = 'how-it-works',
  title,
  description,
  ctaLabel,
  onCtaClick,
  visual,
  visualWrapperClassName =
    'mt-6 flex w-full justify-center sm:mt-8 md:mt-12 md:h-[min(85vh,820px)] lg:mt-20 lg:h-[900px] max-md:h-auto max-md:min-h-0',
}: LandingLendingPoolSectionProps) {
  return (
    <section id={sectionId} className="scroll-mt-24 border-t border-slate-100 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-[90%]">
        <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <h2 className="max-w-lg text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:max-w-xl lg:text-5xl">
            {title}
          </h2>
          <div className="flex max-w-2xl flex-col gap-6 sm:gap-8 lg:items-end">
            <p className="text-lg leading-relaxed text-slate-600 sm:text-xl lg:text-right lg:text-2xl">
              {description}
            </p>
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-500 sm:w-auto lg:text-lg"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
        <div className={visualWrapperClassName}>{visual}</div>
      </div>
    </section>
  )
}
