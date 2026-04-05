import type { DashboardBorderedPanelProps } from './types'

const DashboardBorderedPanel = ({
  title,
  titleAs = 'h3',
  children,
  className,
  panelClassName,
}: DashboardBorderedPanelProps) => {
  const HeadingTag = titleAs

  return (
    <div
      className={[
        'rounded-[6px] border border-[#DFE2E8] bg-white p-4 flex flex-col gap-4',
        panelClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <HeadingTag className="text-black font-bold text-[20px]">{title}</HeadingTag>
      {children}
    </div>
  )
}

export default DashboardBorderedPanel
