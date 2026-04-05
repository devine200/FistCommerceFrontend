import type { AdminPartyStackProps } from './types'

const AdminPartyStack = ({ primary, secondary, secondaryUnderline }: AdminPartyStackProps) => (
  <div className="flex flex-col">
    <span className="text-[#0B1220] text-[14px] font-medium">{primary}</span>
    <span
      className={[
        'text-[#195EBC] text-[12px] mt-1',
        secondaryUnderline ? 'underline underline-offset-2' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {secondary}
    </span>
  </div>
)

export default AdminPartyStack
