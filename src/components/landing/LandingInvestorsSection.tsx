import { useState } from 'react'
import clsx from 'clsx'

import type { LandingInvestorPanelItem } from '@/components/landing/types'

export type LandingInvestorsSectionProps = {
  sectionId?: string
  badge: string
  title: string
  description: string
  panels: LandingInvestorPanelItem[]
  /** Uncontrolled default; omit if you control via `activeIndex` + `onActiveIndexChange` later */
  defaultActiveIndex?: number
}

export function LandingInvestorsSection({
  sectionId = 'investors',
  badge,
  title,
  description,
  panels,
  defaultActiveIndex = 0,
}: LandingInvestorsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex)
  const active = panels[activeIndex] ?? panels[0]

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

        <div className="mt-12 flex flex-col gap-4 sm:mt-14 lg:hidden">
          {panels.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={clsx(
                'w-full rounded-2xl p-6 text-left text-white shadow-sm transition ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-white/50',
                item.toneClassName,
                activeIndex === i ? 'ring-2 ring-white/60' : 'opacity-95'
              )}
            >
              <p className="text-lg font-semibold">{item.title}</p>
              {activeIndex === i && (
                <p className="mt-4 text-base leading-relaxed text-white/95">{item.body}</p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 hidden min-h-[380px] gap-4 lg:mt-14 lg:flex">
          <div
            className={clsx(
              'flex flex-[1_1_68%] flex-col justify-center rounded-2xl p-10 text-white shadow-lg lg:p-12',
              active.toneClassName
            )}
          >
            <h3 className="text-2xl font-bold lg:text-3xl">{active.title}</h3>
            <p className="mt-6 text-base leading-relaxed text-white/95 lg:text-lg">{active.body}</p>
          </div>
          <div className="flex flex-[1_1_32%] gap-2">
            {panels
              .map((item, i) => ({ item, i }))
              .filter(({ i }) => i !== activeIndex)
              .map(({ item, i }) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={clsx(
                    'relative min-h-[320px] flex-1 rounded-2xl transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
                    item.toneClassName
                  )}
                  aria-label={item.title}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-1">
                    <span className="-rotate-90 whitespace-nowrap text-center text-sm font-bold uppercase tracking-wide text-white drop-shadow-sm">
                      {item.short}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
