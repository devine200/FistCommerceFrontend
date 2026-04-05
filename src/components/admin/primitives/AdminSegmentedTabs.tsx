import type { AdminSegmentedTabsProps } from './types'

function AdminSegmentedTabs<T extends string>({ items, value, onChange, variant = 'toolbar' }: AdminSegmentedTabsProps<T>) {
  const base =
    variant === 'toolbar'
      ? 'h-[40px] px-5 rounded-[6px] text-[14px] font-medium border transition-colors'
      : 'min-h-[40px] px-5 rounded-[8px] text-[14px] font-medium transition-colors'

  const inactiveText = variant === 'alerts' ? 'text-[#4D5D80]' : 'text-[#6B7488]'
  const inactiveBorder = variant === 'alerts' ? 'border border-[#E6E8EC]' : 'border border-[#E6E8EC]'

  return (
    <>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              base,
              active
                ? 'bg-[#195EBC] text-white border-[#195EBC]'
                : ['bg-white', inactiveText, inactiveBorder, 'hover:bg-[#F9FAFB]'].join(' '),
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </>
  )
}

export default AdminSegmentedTabs
