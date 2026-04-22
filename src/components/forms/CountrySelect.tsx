import type { SelectHTMLAttributes } from 'react'

import { COUNTRY_OPTIONS } from '@/data/countryOptions'

const fieldClass =
  'w-full border border-[#CFE0FF] rounded-md py-3 pl-4 pr-12 text-[#195EBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#195EBC] cursor-pointer'

type CountrySelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>

/**
 * ISO 3166-1 alpha-2 codes as `value`, English names as labels.
 */
export default function CountrySelect({ className = '', ...props }: CountrySelectProps) {
  return (
    <select className={`${fieldClass} ${className}`.trim()} {...props}>
      <option value="">Select a country</option>
      {COUNTRY_OPTIONS.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
