import type { AdminPageFrameProps } from './types'

/** Standard max-width + vertical rhythm for admin dashboard pages */
const AdminPageFrame = ({ children, className }: AdminPageFrameProps) => (
  <div className={['w-full max-w-[1280px] mx-auto pb-10 flex flex-col gap-6', className].filter(Boolean).join(' ')}>
    {children}
  </div>
)

export default AdminPageFrame
