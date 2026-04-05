export type LandingMissionStatementProps = {
  leadBold: string
  segmentBeforeEmphasis: string
  emphasis: string
  segmentAfterEmphasis: string
  mutedClosing: string
}

export function LandingMissionStatement({
  leadBold,
  segmentBeforeEmphasis,
  emphasis,
  segmentAfterEmphasis,
  mutedClosing,
}: LandingMissionStatementProps) {
  return (
    <p className="ml-auto max-w-5xl text-right text-[22px] font-normal leading-snug text-slate-900 sm:text-[32px] md:text-[45px] md:leading-snug">
      <span className="font-bold text-blue-900">{leadBold}</span>{' '}
      <span className="text-blue-900">
        {segmentBeforeEmphasis}
        <strong className="font-semibold text-blue-800">{emphasis}</strong>
        {segmentAfterEmphasis}
      </span>
      <span className="text-slate-400">{mutedClosing}</span>
    </p>
  )
}
