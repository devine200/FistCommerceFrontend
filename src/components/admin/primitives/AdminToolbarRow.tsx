import type { AdminToolbarRowProps } from './types'

const AdminToolbarRow = ({ start, end, className }: AdminToolbarRowProps) => (
  <div
    className={[
      'px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="flex flex-wrap items-center gap-2">{start}</div>
    {end ? <div className="w-full lg:w-[300px] shrink-0">{end}</div> : null}
  </div>
)

export default AdminToolbarRow
