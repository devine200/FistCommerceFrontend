import {
  INVESTOR_HOW_IT_WORKS_CARDS,
  INVESTOR_HOW_IT_WORKS_HEADING,
  INVESTOR_HOW_IT_WORKS_INTRO,
} from '@/components/dashboard/investor/lending-pool-detail/investorPoolHowItWorksConfig'

const InvestorLendingPoolHowItWorksPageContent = () => {
  return (
    <div className="flex flex-col gap-12 pt-6 sm:pt-8 lg:pt-10 pb-10 min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-14">
        <h1 className="text-[#0B1220] font-bold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.2] tracking-tight max-w-[680px]">
          {INVESTOR_HOW_IT_WORKS_HEADING}
        </h1>
        <p className="text-[#6B7488] text-[17px] sm:text-[18px] leading-[1.65] max-w-[440px] lg:text-right lg:shrink-0">
          {INVESTOR_HOW_IT_WORKS_INTRO}
        </p>
      </div>

      <div className="min-w-0 -mx-1">
        <div
          className="flex flex-row flex-nowrap gap-5 sm:gap-6 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {INVESTOR_HOW_IT_WORKS_CARDS.map((card) => (
            <article
              key={card.id}
              className="flex flex-col shrink-0 w-[min(100%,320px)] sm:w-[308px] rounded-[12px] border border-[#E6E8EC] bg-white p-6 sm:p-7 shadow-sm snap-start"
            >
              <div className="flex h-[132px] w-full items-center justify-center rounded-xl bg-[#195EBC] mb-5">
                <img
                  src={card.imageSrc}
                  alt=""
                  className="max-h-[92px] max-w-[90%] w-auto h-auto object-contain object-center select-none"
                  draggable={false}
                />
              </div>
              <h2 className="text-[#0B1220] font-bold text-[19px] sm:text-[20px] leading-snug">{card.title}</h2>
              <p className="text-[#6B7488] text-[15px] sm:text-[16px] leading-[1.6] mt-3.5">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InvestorLendingPoolHowItWorksPageContent
