import type { StrategyFeature } from '@/components/dashboard/investor/lending-pool-detail/types'
import { POOL_SECTION_TITLE } from '@/components/dashboard/shared/poolDetailTypography'

import strategyIcon0 from '@/assets/s.icon.png'
import strategyIcon1 from '@/assets/s.icon (1).png'
import strategyIcon2 from '@/assets/s.icon (2).png'
import strategyIcon3 from '@/assets/s.icon (3).png'

/** Order matches `strategyFeatures` in pool config: duration, financing, merchants, risk */
const STRATEGY_ASSETS: Record<StrategyFeature['icon'], string> = {
  clock: strategyIcon0,
  briefcase: strategyIcon1,
  target: strategyIcon2,
  shield: strategyIcon3,
}

interface InvestorPoolStrategySectionProps {
  intro: string
  features: StrategyFeature[]
}

const InvestorPoolStrategySection = ({ intro, features }: InvestorPoolStrategySectionProps) => {
  return (
    <section className="rounded-[12px] border border-[#E6E8EC] bg-white p-6 lg:p-8 shadow-sm">
      <h2 className={POOL_SECTION_TITLE}>Pool Strategy</h2>
      <p className="text-[#3A4356] text-[16px] lg:text-[17px] leading-relaxed mt-4 text-justify">{intro}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-[10px] border border-[#E6E8EC] bg-white p-4 sm:p-5 flex gap-4 items-center"
          >
            <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-xl bg-[#195EBC]">
              <img
                src={STRATEGY_ASSETS[f.icon]}
                alt=""
                className="max-h-[40px] max-w-[48px] w-auto h-auto object-contain select-none"
                draggable={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[#0B1220] font-bold text-[17px] leading-snug">{f.title}</h3>
              <p className="text-[#6B7488] text-[15px] mt-1 leading-snug">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default InvestorPoolStrategySection
