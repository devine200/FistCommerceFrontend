import { Link } from 'react-router-dom'

import type { AdminTableTextLinkProps } from './types'

const AdminTableTextLink = ({ to, children, className, onClick }: AdminTableTextLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={['text-[#195EBC] text-[14px] underline underline-offset-2', className].filter(Boolean).join(' ')}
  >
    {children}
  </Link>
)

export default AdminTableTextLink
