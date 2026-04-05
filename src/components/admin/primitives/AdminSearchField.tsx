import type { AdminSearchFieldProps } from './types'

const AdminSearchField = ({ value, onChange, placeholder, 'aria-label': ariaLabel, className }: AdminSearchFieldProps) => (
  <div
    className={[
      'w-full h-[44px] rounded-[6px] border border-[#E6E8EC] bg-white px-3 flex items-center gap-2',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6B7488"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-w-0 bg-transparent outline-none text-[#4D5D80] text-[14px] placeholder:text-[#B0B7C4]"
      aria-label={ariaLabel}
    />
  </div>
)

export default AdminSearchField
