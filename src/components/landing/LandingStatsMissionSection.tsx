import type { ReactNode } from 'react'
import clsx from 'clsx'

import type { LandingStatItem } from '@/components/landing/types'

export type LandingStatsMissionSectionProps = {
  stats: LandingStatItem[]
  mission: ReactNode
  watermarkText?: string
}

export function LandingStatsMissionSection({
  stats,
  mission,
  watermarkText = 'COMMERCE',
}: LandingStatsMissionSectionProps) {
  return (
    <section
      className="relative mt-10 flex flex-col bg-white sm:mt-14 md:mt-16 lg:mt-20 xl:mt-[5rem]"
      aria-label="Platform overview"
    >
      <div className="mx-auto w-[90%]">
        <div className="grid grid-cols-2 md:grid-cols-4" aria-label="Platform statistics">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={clsx(
                'flex flex-col items-center justify-center px-3 py-6 text-center sm:px-6 sm:py-10 md:py-12 lg:py-14',
                (i === 0 || i === 2) && 'max-md:border-r max-md:border-slate-200',
                i < 2 && 'max-md:border-b max-md:border-slate-200',
                i < stats.length - 1 && 'md:border-r md:border-slate-200'
              )}
            >
              <p className="text-[18px] font-medium leading-snug text-slate-600 sm:text-[22px] md:text-[28px]">
                {s.label}
              </p>
              <p className="mt-2 text-[40px] font-bold leading-none text-blue-600 sm:text-[52px] md:text-[72px]">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="py-8 sm:py-12 md:py-14 lg:py-16 xl:py-20">{mission}</div>
      </div>

      {/* @container: COMMERCE font-size uses cqw so it tracks section width and stays on one line */}
      <div className="mx-auto w-[90%] @container pb-6 pt-1 sm:pb-8 sm:pt-2 md:pb-10 lg:pb-12 xl:pb-14">
        <p
          className="block w-full whitespace-nowrap text-center font-extralight uppercase leading-none tracking-[0.045em] text-sky-200/50 sm:tracking-[0.06em]"
          style={{
            fontSize: 'clamp(2.25rem, 15.5cqw, 15rem)',
          }}
          aria-hidden
        >
          {watermarkText}
        </p>
      </div>
    </section>
  )
}
