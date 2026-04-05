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
    <section className="relative mt-[80px] flex flex-col bg-white" aria-label="Platform overview">
      <div className="mx-auto w-[90%]">
        <div className="grid grid-cols-2 md:grid-cols-4" aria-label="Platform statistics">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={clsx(
                'flex flex-col items-center justify-center px-3 py-10 text-center sm:px-6 sm:py-12 md:py-14',
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

        <div className="py-14 sm:py-16 lg:py-20">{mission}</div>
      </div>

      <div className="mx-auto w-[90%] overflow-hidden pb-10 pt-2 sm:pb-12 lg:pb-14">
        <p
          className="block w-full whitespace-nowrap text-center font-extralight uppercase leading-none tracking-[0.06em] text-sky-200/50"
          style={{ fontSize: 'min(23.33vw, 280px)' }}
          aria-hidden
        >
          {watermarkText}
        </p>
      </div>
    </section>
  )
}
