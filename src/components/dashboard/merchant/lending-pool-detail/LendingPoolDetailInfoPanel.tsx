type InfoRow = { label: string; value: string }

interface LendingPoolDetailInfoPanelProps {
  title: string
  rows: InfoRow[]
}

const LendingPoolDetailInfoPanel = ({ title, rows }: LendingPoolDetailInfoPanelProps) => {
  return (
    <div className="rounded-[10px] border border-[#E2E5EA] bg-white overflow-hidden flex flex-col">
      <h3 className="text-[#0B1220] font-bold text-[17px] px-5 py-4 border-b border-[#EEF0F4] bg-white">{title}</h3>
      <dl className="flex flex-col m-0">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex flex-row items-center justify-between gap-4 px-5 py-3.5 text-[14px] border-b border-[#EEF0F4] last:border-b-0 ${
              index % 2 === 1 ? 'bg-[#F4F7F9]' : 'bg-white'
            }`}
          >
            <dt className="text-[#6B7488] font-normal shrink-0">{row.label}</dt>
            <dd className="text-[#0B1220] font-semibold text-right m-0">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default LendingPoolDetailInfoPanel
