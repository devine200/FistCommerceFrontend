import type { AdminPanelProps } from './types'

/** White card shell used for tables and grouped content */
const AdminPanel = ({ children, className }: AdminPanelProps) => (
  <section className={['rounded-[10px] border border-[#E6E8EC] bg-white shadow-sm overflow-hidden', className].filter(Boolean).join(' ')}>
    {children}
  </section>
)

export default AdminPanel
