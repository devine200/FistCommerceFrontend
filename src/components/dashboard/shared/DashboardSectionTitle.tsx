import type { DashboardSectionTitleProps } from './types'

const DashboardSectionTitle = ({ children, as: Tag = 'h3', className }: DashboardSectionTitleProps) => (
  <Tag className={['text-black font-bold text-[20px]', className].filter(Boolean).join(' ')}>{children}</Tag>
)

export default DashboardSectionTitle
