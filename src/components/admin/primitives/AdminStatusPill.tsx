import type { AdminPillVariant, AdminStatusPillProps } from './types'

const VARIANT_CLASS: Record<AdminPillVariant, { bg: string; text: string }> = {
  approved: { bg: 'bg-[#E7F6EC]', text: 'text-[#16A34A]' },
  rejected: { bg: 'bg-[#FBEAE9]', text: 'text-[#EF4444]' },
  underReview: { bg: 'bg-[#F8EEFC]', text: 'text-[#A855F7]' },
  pending: { bg: 'bg-[#FFF0E5]', text: 'text-[#EA580C]' },
  active: { bg: 'bg-[#E7F6EC]', text: 'text-[#16A34A]' },
  late: { bg: 'bg-[#FBEAE9]', text: 'text-[#EF4444]' },
  neutral: { bg: 'bg-[#EEF0F4]', text: 'text-[#6B7488]' },
}

const AdminStatusPill = ({ variant, children, className }: AdminStatusPillProps) => {
  const p = VARIANT_CLASS[variant]
  return (
    <span
      className={['inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium', p.bg, p.text, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}

export default AdminStatusPill
