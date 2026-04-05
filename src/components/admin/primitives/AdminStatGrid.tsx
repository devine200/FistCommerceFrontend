import type { AdminStatGridProps } from './types'

const DEFAULT_COLS = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'

const AdminStatGrid = ({ children, columnsClassName = DEFAULT_COLS, className }: AdminStatGridProps) => (
  <section className={['grid gap-4', columnsClassName, className].filter(Boolean).join(' ')}>{children}</section>
)

export default AdminStatGrid
