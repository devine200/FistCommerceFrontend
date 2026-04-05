export type LandingHeroProps = {
  title: string
  description: string
  ctaLabel: string
  onCtaClick: () => void
}

export function LandingHero({ title, description, ctaLabel, onCtaClick }: LandingHeroProps) {
  return (
    <section className="relative flex min-h-[900px] flex-col justify-end overflow-hidden bg-[#060d18] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-28 lg:pt-32">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[18%]"
        style={{ width: 'min(125vw, 960px)' }}
        aria-hidden
      >
        <div
          className="w-full bg-linear-to-t from-cyan-400/45 via-sky-400/25 to-transparent blur-[52px]"
          style={{
            height: 'calc(min(125vw, 960px) / 2)',
            borderTopLeftRadius: '9999px',
            borderTopRightRadius: '9999px',
          }}
        />
      </div>
      <div className="relative z-10 mx-auto w-[90%]">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-20 xl:gap-24">
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:max-w-3xl lg:text-6xl xl:text-7xl">
            {title}
          </h1>
          <div className="flex max-w-2xl flex-col items-stretch gap-8 lg:items-end lg:gap-10 lg:text-right xl:max-w-3xl">
            <p className="text-lg leading-relaxed text-white/90 sm:text-xl lg:text-2xl">{description}</p>
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-10 py-4 text-base font-semibold text-[#0b1f3a] shadow-lg transition hover:bg-slate-100 sm:w-auto lg:self-end lg:text-lg"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
