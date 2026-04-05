import type { AdminTableShellProps } from './types'

const AdminTableShell = ({ children, minWidthClassName = 'min-w-[1060px]' }: AdminTableShellProps) => (
  <div className="overflow-x-auto">
    <table className={['w-full', minWidthClassName].join(' ')}>{children}</table>
  </div>
)

export default AdminTableShell
