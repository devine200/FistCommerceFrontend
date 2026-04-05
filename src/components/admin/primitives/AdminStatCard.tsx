import type { AdminStatCardProps } from './types'

const AdminStatCard = ({ title, value, titleTone = 'default', titleClassName, className }: AdminStatCardProps) => {
  const titleClass =
    titleTone === 'muted' ? 'text-[#6B7488] text-[14px] font-medium' : 'text-[#0B1220] text-[14px] font-medium'

  return (
    <article
      className={['rounded-[10px] border border-[#E6E8EC] bg-white px-5 py-4 shadow-sm', className].filter(Boolean).join(' ')}
    >
      <p className={[titleClass, 'leading-tight', titleClassName].filter(Boolean).join(' ')}>{title}</p>
      <p className="text-[#0B1220] text-[24px] font-semibold leading-tight mt-3">{value}</p>
    </article>
  )
}

export default AdminStatCard
