import type { AdminTableHeadRowProps } from './types'

const AdminTableHeadRow = ({ labels }: AdminTableHeadRowProps) => (
  <thead>
    <tr className="bg-[#195EBC]">
      {labels.map((h) => (
        <th key={h} className="text-left text-white text-[14px] font-medium px-5 py-4">
          {h}
        </th>
      ))}
    </tr>
  </thead>
)

export default AdminTableHeadRow
