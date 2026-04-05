import clsx from 'clsx'

import type { LandingMerchantBenefitItem } from '@/components/landing/types'

export type LandingMerchantsSectionProps = {
  sectionId?: string
  badge: string
  title: string
  description: string
  benefits: LandingMerchantBenefitItem[]
}

export function LandingMerchantsSection({
  sectionId = 'merchants',
  badge,
  title,
  description,
  benefits,
}: LandingMerchantsSectionProps) {
  return (
    <section
      id={sectionId}
      className="scroll-mt-24 flex min-h-[900px] flex-col justify-center py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-[90%]">
        <div className="mb-12 flex justify-center lg:mb-14">
          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-blue-800">
            {badge}
          </span>
        </div>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <h2 className="max-w-lg text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:max-w-xl lg:text-5xl">
            {title}
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl lg:text-right lg:text-2xl">
            {description}
          </p>
        </div>
        <ul className="mt-12 flex flex-col gap-4 sm:mt-14 sm:gap-5">
          {benefits.map((row) => (
            <li
              key={row.id}
              className={clsx(
                'rounded-2xl px-6 py-5 text-base font-semibold text-white shadow-sm sm:px-8 sm:py-6 sm:text-lg lg:text-xl',
                row.toneClassName
              )}
            >
              {row.prefix} {row.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
